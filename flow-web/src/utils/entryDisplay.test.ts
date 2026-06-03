import { describe, expect, it } from 'vitest';

import {
  getCaffeineLevelLabel,
  getEntryTypeLabel,
  getPhysicalActivityLevelLabel,
  getScreenTimeLevelLabel,
  getSourceTypeLabel
} from './entryDisplay';

describe('entryDisplay', () => {
  it('returns accented labels for entry types and source types', () => {
    expect(getEntryTypeLabel('caffeine')).toBe('Caféine');
    expect(getEntryTypeLabel('screenTime')).toBe("Temps d'écran");
    expect(getEntryTypeLabel('meditation')).toBe('Méditation');
    expect(getSourceTypeLabel('spontaneous')).toBe('Spontané');
  });

  it('returns accented labels for level helpers', () => {
    expect(getCaffeineLevelLabel('high')).toBe('Caféine élevée');
    expect(getPhysicalActivityLevelLabel('moderate')).toBe('Activité modérée');
    expect(getScreenTimeLevelLabel('veryHigh')).toBe("Temps d'écran très élevé");
  });
});
