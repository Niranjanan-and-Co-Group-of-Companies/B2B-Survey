import { createClient } from '@supabase/supabase-js';

// Note: In a real production app with RLS, you might use a SERVICE_ROLE_KEY for admin tasks.
// For now, we mirror the previous backend which reused the ANON_KEY or the key provided in env.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Key env variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
    }
});
