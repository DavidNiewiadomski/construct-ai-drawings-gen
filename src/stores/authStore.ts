import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser, RegisterData, LoginData } from '@/types';
import * as authService from '@/services/supabase';

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
    
    const { error } = await authService.signIn(data.email, data.password);

    if (error) {
      set({ loading: false, error: error.message });
      return { error };
    }

    set({ loading: false });
    return { error: null };
  },

  signUp: async (data: RegisterData) => {
    set({ loading: true, error: null });
    
    const { error } = await authService.signUp(data.email, data.password, {
      full_name: data.full_name,
      company_name: data.company_name,
      role: data.role,
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
    await authService.signOut();
    set({ user: null, session: null, loading: false });
  },

  resetPassword: async (email: string) => {
    set({ loading: true, error: null });
    
    const { error } = await authService.resetPassword(email);

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
      const { profile, error } = await authService.getUserProfile(userId);

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (profile) {
        set({ 
          user: {
            id: profile.user_id,
            email: profile.email,
            full_name: profile.full_name,
            company_name: profile.company_name,
            role: profile.role,
            created_at: profile.created_at,
            avatar_url: profile.avatar_url,
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  },
}));