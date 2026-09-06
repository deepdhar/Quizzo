import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your project credentials from Supabase Dashboard -> Project Settings -> API
export const SUPABASE_URL = 'https://twiazgqiylukfpvxlsuy.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aWF6Z3FpeWx1a2Zwdnhsc3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzQzMDUsImV4cCI6MjEwMjY1MDMwNX0.dP_bjJpfaE-hdUEunBkgVa4Ivop2tw-Acun_Msh7qk0';

export const isSupabaseConfigured = () => {
  return (
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_ID') &&
    !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
