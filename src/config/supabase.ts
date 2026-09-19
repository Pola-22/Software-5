import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reemplaza esto con tu URL
const supabaseUrl = 'https://fwzlgezjfucgzznplxrx.supabase.co'; 

// Reemplaza esto con tu llave anon public
const supabaseAnonKey = 'sb_publishable_G32YLusrKkvxsyLyHdN4kg_vzGaFl5E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});