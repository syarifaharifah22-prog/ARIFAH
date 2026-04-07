import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ndnpryrejwvzzpdmccnt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Az7Rb8aeqcxmFismWRsVCg_exIQ9nrd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
