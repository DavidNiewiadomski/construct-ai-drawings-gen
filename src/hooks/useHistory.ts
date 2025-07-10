import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface HistoryOptions {
  maxHistorySize?: number;
  debounceMs?: number;
  enableGrouping?: boolean;
}

interface HistoryMetadata {
  action?: string;
  timestamp: number;
  description?: string;
}

interface HistoryEntry<T> {
  state: T;
  metadata: HistoryMetadata;
}

export function useHistory<T>(
  initialState: T,
  options: HistoryOptions = {}
) {
  const {
    maxHistorySize = 50,
    debounceMs = 500,
    enableGrouping = true
  } = options;

  const [history, setHistory] = useState<HistoryState<HistoryEntry<T>>>({
    past: [],
    present: {
      state: initialState,
      metadata: {
        timestamp: Date.now(),
        action: 'initial'
      }
    },
    future: []
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const lastActionRef = useRef<string>('');
  const groupingTimeoutRef = useRef<NodeJS.Timeout>();

  // Push new state to history
  const pushHistory = useCallback((
    newState: T, 
    action?: string, 
    description?: string,
    forceNew = false
  ) => {
    // Clear any pending debounced updates
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Create new entry
    const newEntry: HistoryEntry<T> = {
      state: newState,
      metadata: {
        action: action || 'update',
        timestamp: Date.now(),
        description
      }
    };

    const updateHistory = () => {
      setHistory(prev => {
        const shouldGroup = enableGrouping && 
          !forceNew && 
          action === lastActionRef.current && 
          prev.past.length > 0 &&
          Date.now() - prev.present.metadata.timestamp < 2000; // Group within 2 seconds

        if (shouldGroup) {
          // Update current state without adding to history
          return {
            ...prev,
            present: newEntry
          };
        } else {
          // Add new history entry
          const newPast = [...prev.past, prev.present];
          
          // Limit history size
          if (newPast.length > maxHistorySize) {
            newPast.splice(0, newPast.length - maxHistorySize);
          }

          return {
            past: newPast,
            present: newEntry,
            future: [] // Clear future when new action is performed
          };
        }
      });

      lastActionRef.current = action || 'update';
    };

    if (debounceMs > 0 && !forceNew) {
      // Debounce rapid updates
      debounceTimeoutRef.current = setTimeout(updateHistory, debounceMs);
    } else {
      updateHistory();
    }
  }, [maxHistorySize, debounceMs, enableGrouping]);

  // Undo operation
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future]
      };
    });
  }, []);

  // Redo operation
  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory({
      past: [],
      present: history.present,
      future: []
    });
  }, [history.present]);

  // Get history info for UI
  const getHistoryInfo = useCallback(() => {
    return {
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      undoAction: history.past.length > 0 ? history.past[history.past.length - 1].metadata.action : null,
      redoAction: history.future.length > 0 ? history.future[0].metadata.action : null,
      undoDescription: history.past.length > 0 ? history.past[history.past.length - 1].metadata.description : null,
      redoDescription: history.future.length > 0 ? history.future[0].metadata.description : null,
      historySize: history.past.length,
      currentAction: history.present.metadata.action,
      currentDescription: history.present.metadata.description
    };
  }, [history]);

  // Jump to specific history index
  const jumpToHistory = useCallback((index: number) => {
    if (index < 0 || index >= history.past.length + 1) return;

    if (index === history.past.length) {
      // Already at current state
      return;
    }

    setHistory(prev => {
      if (index < prev.past.length) {
        // Jump to past state
        const targetState = prev.past[index];
        const newPast = prev.past.slice(0, index);
        const newFuture = [
          ...prev.past.slice(index + 1),
          prev.present,
          ...prev.future
        ];

        return {
          past: newPast,
          present: targetState,
          future: newFuture
        };
      }

      return prev;
    });
  }, [history]);

  // Force immediate history push (bypasses debouncing)
  const pushHistoryImmediate = useCallback((
    newState: T,
    action?: string,
    description?: string
  ) => {
    pushHistory(newState, action, description, true);
  }, [pushHistory]);

  return {
    state: history.present.state,
    pushHistory,
    pushHistoryImmediate,
    undo,
    redo,
    clearHistory,
    jumpToHistory,
    ...getHistoryInfo()
  };
}