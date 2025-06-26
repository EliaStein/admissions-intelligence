import 'server-only';
export const CONFIG_KEYS = {
  OPEN_AI_KEY: 'OPEN_AI_KEY',
  DB_SERVICE_ROLE_KEY: 'DB_SERVICE_ROLE_KEY'
} as const;

export class ConfigService {
  static async getConfigValue(key: keyof typeof CONFIG_KEYS): Promise<string | null> {
    try {
      const envValue = process.env[key];
      if (!envValue) {
        throw new Error(`Config value for key '${key}' not found in environment variables`);
      }

      return envValue;
    } catch (error) {
      console.error(`Error retrieving config value for key '${key}':`, error);
      return null;
    }
  }
}
