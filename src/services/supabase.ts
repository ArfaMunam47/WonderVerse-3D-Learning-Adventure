/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve public client-safe environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder')
  );
};

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  });
}

export const supabase = supabaseInstance;

/**
 * Transforms Supabase or network error objects into friendly, understandable messages
 * suitable for parents and children.
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const msg = typeof error === 'string' ? error : error.message || '';
  const lower = msg.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant') || lower.includes('wrong password') || lower.includes('invalid email or password')) {
    return 'The email or password is incorrect.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('duplicate key')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak password')) {
    return 'Password should be at least 6 characters.';
  }
  if (lower.includes('valid email') || lower.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('fetch') || lower.includes('timeout')) {
    return "We couldn't connect right now. Please check your connection and try again.";
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  return "We couldn't complete your request. Please try again.";
}
