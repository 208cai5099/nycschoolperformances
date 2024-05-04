import { createClient } from '@supabase/supabase-js';

console.log(process.env)
console.log(process.env.REACT_APP_SUPABASE_API_KEY)
console.log(process.env.REACT_APP_SUPABASE_URL)

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_API_KEY)
console.log(supabase);

export default supabase;