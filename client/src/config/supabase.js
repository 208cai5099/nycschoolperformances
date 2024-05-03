import { createClient } from '@supabase/supabase-js';

const supabase = createClient("https://ugldyoegyicvacpdllzj.supabase.co", 
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbGR5b2VneWljdmFjcGRsbHpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ3NzE4NjYsImV4cCI6MjAzMDM0Nzg2Nn0.A3cq3de-jpc0R1l5P0mlSbg8fj2ckN_12x7kFAB0Jpc")

export default supabase;