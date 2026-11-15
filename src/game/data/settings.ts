export type Settings = {
  language: 'es' | 'en'; music: number; effects: number;
  difficulty: 'easy' | 'normal' | 'hard'; graphics: 'high' | 'low';
  sensitivity: number; tips: boolean; device: 'auto' | 'desktop' | 'tablet' | 'mobile';
};
export const SETTINGS_KEY = 'astrominer-device-settings';
export const defaultSettings: Settings = { language: 'es', music: 60, effects: 80, difficulty: 'normal', graphics: 'high', sensitivity: 50, tips: true, device: 'auto' };
export function parseSettings(raw: string | null): Settings {
  try {
    const value = JSON.parse(raw ?? '{}');
    if (!value || typeof value !== 'object') return { ...defaultSettings };
    const result = { ...defaultSettings };
    for (const key of ['music', 'effects', 'sensitivity'] as const) {
      if (typeof value[key] === 'number' && Number.isFinite(value[key])) result[key] = Math.max(0, Math.min(100, value[key]));
    }
    if (value.language === 'es' || value.language === 'en') result.language = value.language;
    if (['easy', 'normal', 'hard'].includes(value.difficulty)) result.difficulty = value.difficulty;
    if (['high', 'low'].includes(value.graphics)) result.graphics = value.graphics;
    if (['auto', 'desktop', 'tablet', 'mobile'].includes(value.device)) result.device = value.device;
    if (typeof value.tips === 'boolean') result.tips = value.tips;
    return result;
  } catch { return { ...defaultSettings }; }
}