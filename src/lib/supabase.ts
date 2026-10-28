import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getAppConfig } from './env'

const config = getAppConfig()

export const supabase: SupabaseClient | null = config.hasSupabase
  ? createClient(config.supabaseUrl!, config.supabaseAnonKey!)
  : null
