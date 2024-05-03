
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://tbtaiasgpklkrifwkqii.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidGFpYXNncGtsa3JpZndrcWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ3MDgwNTEsImV4cCI6MjAzMDI4NDA1MX0.lJxQQASlhJzoNs9I1ymxbtknVjBLuDmb6TxpQ07wYCg'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;