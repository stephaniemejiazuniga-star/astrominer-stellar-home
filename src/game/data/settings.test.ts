import { describe, expect, it } from 'vitest';
import { defaultSettings, parseSettings } from './settings';
describe('Device preferences', () => {
  it('retains configuration when reopened', () => {
    const settings = { ...defaultSettings, language: 'en', music: 25, effects: 70, difficulty: 'hard', graphics: 'low', sensitivity: 35, tips: false, device: 'tablet' };
    expect(parseSettings(JSON.stringify(settings))).toEqual(settings);
  });
  it('has independent music and effects controls', () => {
    expect(parseSettings('{"music":0,"effects":85}')).toMatchObject({ music: 0, effects: 85 });
  });
  it('recovers from invalid stored preferences', () => {
    expect(parseSettings('broken')).toEqual(defaultSettings);
    expect(parseSettings('{"music":-1,"effects":150}')).toMatchObject({ music: 0, effects: 100 });
  });
});