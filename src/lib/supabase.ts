import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables');
}

// server-side client using service role (server only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  // optional: set auth storage to none, etc
  auth: { persistSession: false }
});
