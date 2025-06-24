import { supabase } from '../lib/supabase';

export const CONFIG_KEYS = {
  OPEN_AI_KEY: 'OPEN_AI_KEY',
} as const;

export class ConfigService {

  static async getConfigValue(key: keyof typeof CONFIG_KEYS): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('config')
        .select('value')
        .eq('id', key)
        .single();
      console.log({data, error})
      if (error) {
        console.error(`Error fetching config value for key '${key}':`, error);
        return null;
      }

      return data?.value || null;
    } catch (error) {
      console.error(`Error retrieving config value for key '${key}':`, error);
      return null;
    }
  }
}
