import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser, RegisterData, LoginData } from '@/types';

interface AuthStore {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  signIn: (data: LoginData) => Promise<{ error: any }>;
  signUp: (data: RegisterData) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  setUser: (user: AppUser | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUserProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  signIn: async (data: LoginData) => {
    set({ loading: true, error: null });
    
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      set({ loading: false, error: error.message });
      return { error };
    }

    set({ loading: false });
    return { error: null };
  },

  signUp: async (data: RegisterData) => {
    set({ loading: true, error: null });
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: data.full_name,
          company_name: data.company_name,
          role: data.role,
        }
      }
    });

    if (error) {
      set({ loading: false, error: error.message });
      return { error };
    }

    set({ loading: false });
    return { error: null };
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false });
  },

  resetPassword: async (email: string) => {
    set({ loading: true, error: null });
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      set({ loading: false, error: error.message });
      return { error };
    }

    set({ loading: false });
    return { error: null };
  },

  setUser: (user: AppUser | null) => set({ user }),
  setSession: (session: Session | null) => set({ session }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),

  fetchUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        set({ 
          user: {
            id: data.user_id,
            email: data.email,
            full_name: data.full_name,
            company_name: data.company_name,
            role: data.role,
            created_at: data.created_at,
            avatar_url: data.avatar_url,
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  },
}));