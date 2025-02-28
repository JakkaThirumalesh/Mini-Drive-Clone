const { createClient } = require("@supabase/supabase-js");

async function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  return createClient(supabaseUrl, supabaseKey);
}

module.exports = createSupabaseClient;
