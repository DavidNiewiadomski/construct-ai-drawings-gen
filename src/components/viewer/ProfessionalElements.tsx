import React from 'react';
import { Rotate3D, Compass, MapPin, FileText, GitBranch } from 'lucide-react';

interface NorthArrowProps {
  rotation: number;
  position: { x: number; y: number };
  scale?: number;
}

export function NorthArrow({ rotation, position, scale = 1 }: NorthArrowProps) {
  const size = 60 * scale;
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center'
      }}
    >
      <div className="bg-white border-2 border-black rounded-full p-2 shadow-md">
        <svg width={size} height={size} viewBox="0 0 60 60">
          {/* Outer circle */}
          <circle cx="30" cy="30" r="28" fill="white" stroke="black" strokeWidth="2"/>
          
          {/* North arrow */}
          <path
            d="M30 8 L35 22 L30 18 L25 22 Z"
            fill="black"
            stroke="black"
            strokeWidth="1"
          />
          
          {/* South point */}
          <path
            d="M30 52 L35 38 L30 42 L25 38 Z"
            fill="white"
            stroke="black"
            strokeWidth="1"
          />
          
          {/* Cardinal directions */}
          <text x="30" y="6" textAnchor="middle" fontSize="8" fontWeight="bold">N</text>
          <text x="54" y="34" textAnchor="middle" fontSize="6">E</text>
          <text x="30" y="58" textAnchor="middle" fontSize="6">S</text>
          <text x="6" y="34" textAnchor="middle" fontSize="6">W</text>
          
          {/* Center dot */}
          <circle cx="30" cy="30" r="2" fill="black"/>
        </svg>
      </div>
    </div>
  );
}

interface ScaleBarProps {
  position: { x: number; y: number };
  scale: number; // pixels per foot
  units?: 'imperial' | 'metric';
}

export function ScaleBar({ position, scale, units = 'imperial' }: ScaleBarProps) {
  const segments = units === 'imperial' ? [1, 2, 5, 10] : [1, 2, 5, 10]; // feet or meters
  const segmentWidth = scale; // pixels per unit
  
  return (
    <div 
      className="absolute bg-white border border-black p-2 shadow-md"
      style={{ left: position.x, top: position.y }}
    >
      <div className="text-xs font-bold mb-1">SCALE</div>
      <svg width={segmentWidth * segments[segments.length - 1]} height="30">
        {/* Main scale bar */}
        <rect x="0" y="10" width={segmentWidth * segments[segments.length - 1]} height="8" 
              fill="white" stroke="black" strokeWidth="1"/>
        
        {/* Alternating fill */}
        {segments.map((segment, index) => {
          if (index === 0) return null;
          const x = segmentWidth * segments[index - 1];
          const width = segmentWidth * (segment - segments[index - 1]);
          return (
            <rect 
              key={index}
              x={x} 
              y="10" 
              width={width} 
              height="8"
              fill={index % 2 === 0 ? "white" : "black"}
            />
          );
        })}
        
        {/* Scale marks */}
        {segments.map((segment, index) => (
          <g key={index}>
            <line 
              x1={segmentWidth * segment} 
              y1="8" 
              x2={segmentWidth * segment} 
              y2="20" 
              stroke="black" 
              strokeWidth="1"
            />
            <text 
              x={segmentWidth * segment} 
              y="26" 
              textAnchor="middle" 
              fontSize="8"
            >
              {segment}{units === 'imperial' ? '\'' : 'm'}
            </text>
          </g>
        ))}
        
        {/* Zero mark */}
        <text x="0" y="26" textAnchor="middle" fontSize="8">0</text>
      </svg>
      <div className="text-xs mt-1">1/4" = 1'-0"</div>
    </div>
  );
}

interface BackingLegendProps {
  position: { x: number; y: number };
  backingTypes: Array<{
    type: string;
    color: string;
    description: string;
    count?: number;
  }>;
}

export function BackingLegend({ position, backingTypes }: BackingLegendProps) {
  return (
    <div 
      className="absolute bg-white border border-black p-3 shadow-md min-w-48"
      style={{ left: position.x, top: position.y }}
    >
      <div className="text-sm font-bold mb-2 flex items-center gap-1">
        <MapPin className="w-4 h-4" />
        BACKING LEGEND
      </div>
      <div className="space-y-1">
        {backingTypes.map((backing, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-4 h-3 border border-black"
              style={{ backgroundColor: backing.color }}
            />
            <span className="font-medium">{backing.type}</span>
            <span className="text-gray-600">{backing.description}</span>
            {backing.count && (
              <span className="text-gray-500 ml-auto">({backing.count})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface GeneralNotesProps {
  position: { x: number; y: number };
  notes: string[];
  title?: string;
}

export function GeneralNotes({ position, notes, title = "GENERAL NOTES" }: GeneralNotesProps) {
  return (
    <div 
      className="absolute bg-white border border-black p-3 shadow-md max-w-md"
      style={{ left: position.x, top: position.y }}
    >
      <div className="text-sm font-bold mb-2 flex items-center gap-1">
        <FileText className="w-4 h-4" />
        {title}
      </div>
      <div className="space-y-1">
        {notes.map((note, index) => (
          <div key={index} className="text-xs flex">
            <span className="mr-2 font-medium">{index + 1}.</span>
            <span>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RevisionTableProps {
  position: { x: number; y: number };
  revisions: Array<{
    number: string;
    date: string;
    description: string;
    by: string;
  }>;
}

export function RevisionTable({ position, revisions }: RevisionTableProps) {
  return (
    <div 
      className="absolute bg-white border border-black shadow-md"
      style={{ left: position.x, top: position.y }}
    >
      <div className="text-sm font-bold p-2 border-b border-black flex items-center gap-1">
        <GitBranch className="w-4 h-4" />
        REVISIONS
      </div>
      <table className="text-xs">
        <thead>
          <tr className="border-b border-black">
            <th className="px-2 py-1 border-r border-black">REV</th>
            <th className="px-2 py-1 border-r border-black">DATE</th>
            <th className="px-2 py-1 border-r border-black">DESCRIPTION</th>
            <th className="px-2 py-1">BY</th>
          </tr>
        </thead>
        <tbody>
          {revisions.map((rev, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="px-2 py-1 border-r border-gray-300 text-center font-medium">
                {rev.number}
              </td>
              <td className="px-2 py-1 border-r border-gray-300 text-center">
                {rev.date}
              </td>
              <td className="px-2 py-1 border-r border-gray-300">
                {rev.description}
              </td>
              <td className="px-2 py-1 text-center">
                {rev.by}
              </td>
            </tr>
          ))}
          {/* Empty rows for future revisions */}
          {Array.from({ length: Math.max(0, 5 - revisions.length) }, (_, i) => (
            <tr key={`empty-${i}`} className="border-b border-gray-300">
              <td className="px-2 py-1 border-r border-gray-300 h-6"></td>
              <td className="px-2 py-1 border-r border-gray-300"></td>
              <td className="px-2 py-1 border-r border-gray-300"></td>
              <td className="px-2 py-1"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}