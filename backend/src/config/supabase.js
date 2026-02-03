import { createClient } from '@supabase/supabase-js';
import config from './index.js';

// Create Supabase client
const supabase = createClient(
    config.supabaseUrl,
    config.supabaseAnonKey
);

export { supabase };
