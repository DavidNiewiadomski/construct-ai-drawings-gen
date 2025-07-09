import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AuthResponse {
  error: any;
  user?: User | null;
}

export interface ProfileUpdate {
  full_name?: string;
  company_name?: string;
  avatar_url?: string;
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      error,
      user: data.user,
    };
  } catch (error) {
    return {
      error,
      user: null,
    };
  }
}

// Sign up with email, password, and metadata
export async function signUp(
  email: string, 
  password: string, 
  metadata: Record<string, any>
): Promise<AuthResponse> {
  try {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });

    return {
      error,
      user: data.user,
    };
  } catch (error) {
    return {
      error,
      user: null,
    };
  }
}

// Sign out current user
export async function signOut(): Promise<{ error: any }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
}

// Reset password
export async function resetPassword(email: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  } catch (error) {
    return { error };
  }
}

// Update user profile
export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);

    return { error };
  } catch (error) {
    return { error };
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    return {
      session: data.session,
      error,
    };
  } catch (error) {
    return {
      session: null,
      error,
    };
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return {
      profile: data,
      error,
    };
  } catch (error) {
    return {
      profile: null,
      error,
    };
  }
}