// src/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Make sure you add these to your .env file at the root of the project
// VITE_SUPABASE_URL=your_supabase_project_url
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL or anon key not found. Please check your .env file.'
  )
}

// Export a single Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
