// Lazy Supabase client — only initializes when env vars are present.
// The app works fully without Supabase configured.
// Install @supabase/supabase-js when ready to use:
//   npm install @supabase/supabase-js

let _client: any = null;

export function getSupabase(): any | null {
  if (_client) return _client;

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    // Dynamic import to avoid hard dependency
    const { createClient } = require("@supabase/supabase-js");
    _client = createClient(url, key);
    return _client;
  } catch {
    console.warn("Supabase client not available — install @supabase/supabase-js");
    return null;
  }
}
