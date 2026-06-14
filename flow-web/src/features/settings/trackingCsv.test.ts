import type { TrackingEntry } from '../../types/tracking';

import {
  buildTrackingEntriesCsv,
  buildTrackingEntriesCsvDownloadContent,
  exportTrackingEntriesCsv,
  TRACKING_ENTRY_COLUMNS
} from './trackingCsv';

describe('trackingCsv', () => {
  it('returns a header row with every TrackingEntry column even when there are no entries', () => {
    expect(buildTrackingEntriesCsv([])).toBe(TRACKING_ENTRY_COLUMNS.join(','));
  });

  it('serializes every column, preserves empty fields, and escapes CSV values', () => {
    const entry: TrackingEntry = {
      id: 'entry-1',
      timestamp: '2026-06-12T08:00:00.000Z',
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      completedFromNotification: false,
      migraineMedicationTaken: true,
      eventNote: 'Cafe, deja "pret"',
      freeNote: 'ligne 1\nligne 2',
      comment: '\u00e9nergie et caf\u00e9'
    };

    const csv = buildTrackingEntriesCsv([entry]);
    const parsed = parseCsv(csv);

    expect(parsed[0]).toEqual([...TRACKING_ENTRY_COLUMNS]);
    expect(parsed[1]).toEqual([
      'entry-1',
      '2026-06-12T08:00:00.000Z',
      'freeNote',
      'spontaneous',
      '',
      '',
      'false',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'true',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'Cafe, deja "pret"',
      'ligne 1\nligne 2',
      '',
      '',
      '\u00e9nergie et caf\u00e9'
    ]);
  });

  it('prefixes the downloadable CSV content with a UTF-8 BOM', () => {
    const content = buildTrackingEntriesCsvDownloadContent([
      {
        id: 'entry-3',
        timestamp: '2026-06-12T10:45:00.000Z',
        entryType: 'freeNote',
        sourceType: 'spontaneous',
        comment: 'Cr\u00e8me br\u00fbl\u00e9e'
      }
    ]);

    expect(content).toBe(
      `\uFEFF${TRACKING_ENTRY_COLUMNS.join(',')}\r\nentry-3,2026-06-12T10:45:00.000Z,freeNote,spontaneous,,,,,,,,,,,,,,,,,,,,,,,,,,,,Cr\u00e8me br\u00fbl\u00e9e`
    );
  });

  it('downloads a CSV file with a stable filename', async () => {
    const urlApi = {
      createObjectURL: vi.fn(() => 'blob:flow-export'),
      revokeObjectURL: vi.fn()
    };
    const link = document.createElement('a');
    const clickSpy = vi.spyOn(link, 'click').mockImplementation(() => undefined);
    const documentRef = {
      body: document.body,
      createElement: vi.fn((tagName: string) => (tagName === 'a' ? link : document.createElement(tagName)))
    } as unknown as Document;

    const filename = await exportTrackingEntriesCsv({
      documentRef,
      now: new Date('2026-06-12T10:30:00'),
      repository: {
        listEntries: async () => [
          {
            id: 'entry-2',
            timestamp: '2026-06-12T09:30:00.000Z',
            entryType: 'checkIn',
            sourceType: 'scheduledCheckIn',
            comment: 'Cr\u00e8me br\u00fbl\u00e9e'
          }
        ]
      },
      urlApi
    });

    expect(filename).toBe('flow-tracking-entries-2026-06-12.csv');
    expect(link.download).toBe('flow-tracking-entries-2026-06-12.csv');
    expect(link.href).toBe('blob:flow-export');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(urlApi.revokeObjectURL).toHaveBeenCalledWith('blob:flow-export');
    expect(urlApi.createObjectURL).toHaveBeenCalledTimes(1);
  });
});

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const nextCharacter = csv[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && character === ',') {
      currentRow.push(currentCell);
      currentCell = '';
      continue;
    }

    if (!inQuotes && character === '\r' && nextCharacter === '\n') {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      index += 1;
      continue;
    }

    currentCell += character;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows;
}
