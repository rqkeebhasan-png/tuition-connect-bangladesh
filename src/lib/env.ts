export type AppConfig = {
  supabaseUrl?: string
  supabaseAnonKey?: string
  hasSupabase: boolean
}

export function getAppConfig(): AppConfig {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  return {
    supabaseUrl: supabaseUrl || undefined,
    supabaseAnonKey: supabaseAnonKey || undefined,
    hasSupabase: Boolean(supabaseUrl && supabaseAnonKey),
  }
}
