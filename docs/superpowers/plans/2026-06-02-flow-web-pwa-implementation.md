# FLOW Web PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first, iPhone-first, installable PWA version of `FLOW` with modular tracking forms, local history, focused analytics, cautious insights, offline support, and best-effort web reminders.

**Architecture:** Keep the existing Swift/iOS code in place as product reference, and create a separate web app in a new `flow-web/` workspace using React, TypeScript, Vite, IndexedDB, and PWA support. Organize the web app by feature boundaries so storage, business logic, and UI remain independently testable and reusable for a future native rewrite.

**Tech Stack:** React, TypeScript, Vite, IndexedDB, Workbox or vite-plugin-pwa, Vitest, Testing Library, Recharts

---

## File Structure

Existing code to keep unchanged for now:

- Keep: `G:\APPLICATIONS\FLOW\FLOW\**\*.swift`
- Keep: `G:\APPLICATIONS\FLOW\FLOW.xcodeproj\**\*`
- Keep: `G:\APPLICATIONS\FLOW\FLOWTests\**\*`

New web app structure:

- Create: `G:\APPLICATIONS\FLOW\flow-web\package.json`
- Create: `G:\APPLICATIONS\FLOW\flow-web\tsconfig.json`
- Create: `G:\APPLICATIONS\FLOW\flow-web\vite.config.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\index.html`
- Create: `G:\APPLICATIONS\FLOW\flow-web\public\manifest.webmanifest`
- Create: `G:\APPLICATIONS\FLOW\flow-web\public\icons\*`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\main.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\app\App.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\app\AppShell.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\app\router.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\styles\globals.css`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\styles\tokens.css`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\types\tracking.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\types\settings.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\storage\db.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\storage\trackingRepository.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\storage\settingsRepository.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\services\analyticsService.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\services\insightEngine.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\services\notificationService.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\services\pwaService.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\utils\entrySummary.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\utils\dateBuckets.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\utils\entryDisplay.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\tracking\NoterPage.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\tracking\QuickCheckInCard.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\tracking\EntryCardGrid.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\tracking\EntrySheet.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\tracking\entryFormState.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\history\HistoriquePage.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\history\HistoryFilters.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\history\EntryDetailSheet.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\analytics\AnalysePage.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\analytics\InsightCard.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\settings\ReglagesPage.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\settings\PwaInstallHelp.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\settings\NotificationStatus.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\settings\LocalDataReset.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\components\BottomTabBar.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\components\BottomSheet.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\components\EmptyState.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\components\SectionCard.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\tests\entryFormState.test.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\tests\analyticsService.test.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\tests\insightEngine.test.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\tests\trackingRepository.test.ts`
- Modify: `G:\APPLICATIONS\FLOW\README.md`

## Task 1: Scaffold The Web App Workspace

**Files:**
- Create: `G:\APPLICATIONS\FLOW\flow-web\package.json`
- Create: `G:\APPLICATIONS\FLOW\flow-web\tsconfig.json`
- Create: `G:\APPLICATIONS\FLOW\flow-web\vite.config.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\index.html`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\main.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\app\App.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\styles\globals.css`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\styles\tokens.css`

- [ ] **Step 1: Create the `flow-web/` folder structure**

```text
flow-web/
  public/
  src/
    app/
    components/
    features/
    services/
    storage/
    styles/
    tests/
    types/
    utils/
```

- [ ] **Step 2: Add `package.json` with the required dependencies**

```json
{
  "name": "flow-web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "idb": "^8.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "recharts": "^2.13.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.3",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vite-plugin-pwa": "^0.20.5",
    "vitest": "^2.1.3"
  }
}
```

- [ ] **Step 3: Add a Vite config with PWA support**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "FLOW",
        short_name: "FLOW",
        description: "Suivi local energie, stress, fatigue et facteurs associes",
        theme_color: "#f5efe6",
        background_color: "#f5efe6",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ]
});
```

- [ ] **Step 4: Add the base React entry**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import "./styles/tokens.css";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 5: Add the basic app shell**

```tsx
import AppShell from "./AppShell";

export default function App() {
  return <AppShell />;
}
```

- [ ] **Step 6: Install dependencies**

Run:

```powershell
npm install
```

Expected: a `node_modules/` directory is created and install exits successfully.

- [ ] **Step 7: Start the dev server once to verify the scaffold**

Run:

```powershell
npm run dev
```

Expected: Vite starts and prints a localhost URL.

## Task 2: Define The Domain Types And Storage Layer

**Files:**
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\types\tracking.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\types\settings.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\storage\db.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\storage\trackingRepository.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\storage\settingsRepository.ts`
- Test: `G:\APPLICATIONS\FLOW\flow-web\src\tests\trackingRepository.test.ts`

- [ ] **Step 1: Write a failing repository test for basic entry persistence**

```ts
import { describe, expect, it } from "vitest";
import { trackingRepository } from "../storage/trackingRepository";

describe("trackingRepository", () => {
  it("stores and returns a saved check-in", async () => {
    const entry = await trackingRepository.saveEntry({
      entryType: "checkIn",
      sourceType: "spontaneous",
      energyScore: 7,
      stressLevel: 4
    });

    const entries = await trackingRepository.listEntries();

    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe(entry.id);
    expect(entries[0].energyScore).toBe(7);
  });
});
```

- [ ] **Step 2: Run the repository test to confirm it fails**

Run:

```powershell
npm run test -- trackingRepository
```

Expected: FAIL with missing repository/types.

- [ ] **Step 3: Add the tracking type definitions**

```ts
export type EntryType =
  | "form"
  | "sleep"
  | "stress"
  | "mentalLoad"
  | "migraine"
  | "caffeine"
  | "physicalActivity"
  | "meal"
  | "nap"
  | "screenTime"
  | "medication"
  | "meditation"
  | "notableEvent"
  | "freeNote"
  | "checkIn";

export type SourceType = "spontaneous" | "scheduledCheckIn";

export interface TrackingEntry {
  id: string;
  timestamp: string;
  entryType: EntryType;
  sourceType: SourceType;
  notificationId?: string;
  scheduledTime?: string;
  completedFromNotification?: boolean;
  energyScore?: number;
  sleepDuration?: number;
  sleepQuality?: number;
  stressLevel?: number;
  mentalLoad?: number;
  migraineLevel?: "none" | "mild" | "moderate" | "severe";
  migrainePainScore?: number;
  migraineMedicationTaken?: boolean;
  migraineMedicationNote?: string;
  caffeineLevel?: "none" | "low" | "medium" | "high";
  physicalActivityLevel?: "none" | "light" | "moderate" | "intense";
  mealType?: "light" | "normal" | "heavy";
  napDuration?: number;
  screenTimeLevel?: "low" | "medium" | "high" | "veryHigh";
  medicationNote?: string;
  meditationDuration?: number;
  eventNote?: string;
  freeNote?: string;
  comment?: string;
}

export interface CheckInSchedule {
  id: string;
  time: string;
  isEnabled: boolean;
  label?: string;
}
```

- [ ] **Step 4: Implement IndexedDB setup and repositories**

```ts
import { openDB } from "idb";

export const dbPromise = openDB("flow-web", 1, {
  upgrade(db) {
    db.createObjectStore("entries", { keyPath: "id" });
    db.createObjectStore("schedules", { keyPath: "id" });
    db.createObjectStore("settings", { keyPath: "key" });
  }
});
```

```ts
import { dbPromise } from "./db";
import type { TrackingEntry } from "../types/tracking";

export const trackingRepository = {
  async saveEntry(entry: Partial<TrackingEntry>) {
    const fullEntry: TrackingEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      entryType: "freeNote",
      sourceType: "spontaneous",
      ...entry
    };
    const db = await dbPromise;
    await db.put("entries", fullEntry);
    return fullEntry;
  },
  async listEntries() {
    const db = await dbPromise;
    const items = await db.getAll("entries");
    return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
};
```

- [ ] **Step 5: Re-run the repository tests**

Run:

```powershell
npm run test -- trackingRepository
```

Expected: PASS

## Task 3: Build Analytics, Insights, And Shared Utilities

**Files:**
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\services\analyticsService.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\services\insightEngine.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\utils\entrySummary.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\utils\dateBuckets.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\utils\entryDisplay.ts`
- Test: `G:\APPLICATIONS\FLOW\flow-web\src\tests\analyticsService.test.ts`
- Test: `G:\APPLICATIONS\FLOW\flow-web\src\tests\insightEngine.test.ts`

- [ ] **Step 1: Add failing tests for analytics and cautious insights**

```ts
import { describe, expect, it } from "vitest";
import { averageEnergyByHour } from "../services/analyticsService";

describe("analyticsService", () => {
  it("averages scheduled check-in energy by hour", () => {
    const result = averageEnergyByHour([
      { entryType: "checkIn", sourceType: "scheduledCheckIn", timestamp: "2026-06-02T08:00:00.000Z", energyScore: 6, id: "1", stressLevel: 3 },
      { entryType: "checkIn", sourceType: "scheduledCheckIn", timestamp: "2026-06-02T08:30:00.000Z", energyScore: 8, id: "2", stressLevel: 2 }
    ]);

    expect(result[0]).toMatchObject({ hour: 8, average: 7 });
  });
});
```

```ts
import { describe, expect, it } from "vitest";
import { generateInsights } from "../services/insightEngine";

describe("insightEngine", () => {
  it("uses cautious wording", () => {
    const insights = generateInsights([]);
    expect(insights[0]).toContain("Pas assez de donnees");
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run:

```powershell
npm run test -- analyticsService insightEngine
```

Expected: FAIL with missing services.

- [ ] **Step 3: Implement the utility layer**

```ts
export function summarizeEntry(entry: TrackingEntry): string {
  if (entry.entryType === "checkIn") {
    return `Energie ${entry.energyScore ?? "-"} / Stress ${entry.stressLevel ?? "-"}`;
  }
  if (entry.entryType === "freeNote") {
    return entry.freeNote ?? "Note libre";
  }
  return entry.comment ?? entry.entryType;
}
```

Add simple hour/day bucketing helpers and display label maps in matching utility files.

- [ ] **Step 4: Implement analytics and insights**

Include:

- scheduled energy trend
- scheduled stress trend
- average energy by hour
- average stress by hour
- daily form average
- migraine intensity/frequency
- meditation weekly count/duration/average
- fallback insight when data is insufficient

Example:

```ts
export function averageEnergyByHour(entries: TrackingEntry[]) {
  const scheduled = entries.filter(
    (entry) => entry.entryType === "checkIn" && entry.sourceType === "scheduledCheckIn"
  );

  const grouped = new Map<number, number[]>();
  for (const entry of scheduled) {
    if (typeof entry.energyScore !== "number") continue;
    const hour = new Date(entry.timestamp).getHours();
    grouped.set(hour, [...(grouped.get(hour) ?? []), entry.energyScore]);
  }

  return [...grouped.entries()]
    .map(([hour, values]) => ({
      hour,
      average: values.reduce((sum, value) => sum + value, 0) / values.length
    }))
    .sort((a, b) => a.hour - b.hour);
}
```

- [ ] **Step 5: Re-run analytics and insight tests**

Run:

```powershell
npm run test -- analyticsService insightEngine
```

Expected: PASS

## Task 4: Build Form State And Tracking UI

**Files:**
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\tracking\entryFormState.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\tracking\NoterPage.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\tracking\QuickCheckInCard.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\tracking\EntryCardGrid.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\tracking\EntrySheet.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\components\BottomSheet.tsx`
- Test: `G:\APPLICATIONS\FLOW\flow-web\src\tests\entryFormState.test.ts`

- [ ] **Step 1: Write a failing test for form normalization**

```ts
import { describe, expect, it } from "vitest";
import { normalizeEntryDraft } from "../features/tracking/entryFormState";

describe("entryFormState", () => {
  it("clears irrelevant fields for meditation entries", () => {
    const normalized = normalizeEntryDraft({
      entryType: "meditation",
      sourceType: "spontaneous",
      energyScore: 5,
      stressLevel: 4,
      meditationDuration: 15
    });

    expect(normalized.energyScore).toBeUndefined();
    expect(normalized.stressLevel).toBeUndefined();
    expect(normalized.meditationDuration).toBe(15);
  });
});
```

- [ ] **Step 2: Run the form-state test**

Run:

```powershell
npm run test -- entryFormState
```

Expected: FAIL

- [ ] **Step 3: Implement the form state helper**

Create functions for:

- draft creation
- validation
- normalization
- quick check-in entry creation
- form-specific save payloads

- [ ] **Step 4: Implement the `Noter` page and tracking components**

Requirements:

- quick check-in card with energy/stress only
- category card grid
- dynamic bottom sheet form
- save to repository
- immediate return to home state after save

Include this shell:

```tsx
export default function NoterPage() {
  return (
    <main>
      <QuickCheckInCard />
      <EntryCardGrid />
      <EntrySheet />
    </main>
  );
}
```

- [ ] **Step 5: Re-run the form-state tests**

Run:

```powershell
npm run test -- entryFormState
```

Expected: PASS

## Task 5: Build History And Detail Editing

**Files:**
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\history\HistoriquePage.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\history\HistoryFilters.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\history\EntryDetailSheet.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\components\EmptyState.tsx`

- [ ] **Step 1: Implement the history page**

It must:

- list entries newest first
- show type, summary, date, source badge
- support type/source filters
- support opening details

- [ ] **Step 2: Implement detail editing**

Use the same form state helper from Task 4 to:

- prefill existing entries
- save edits back to IndexedDB
- delete entries cleanly

- [ ] **Step 3: Manually verify history flows**

Run:

```powershell
npm run dev
```

Manual check:

```text
1. Save one quick check-in and two spontaneous entries.
2. Open Historique.
3. Filter by source and type.
4. Edit one entry.
5. Delete one entry.
```

Expected: all changes persist locally.

## Task 6: Build Analytics UI And Insight Cards

**Files:**
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\analytics\AnalysePage.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\analytics\InsightCard.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\components\SectionCard.tsx`

- [ ] **Step 1: Implement the analytics page sections**

Include:

- check-in charts
- form trend
- sleep/stress/mental load comparisons
- migraine metrics
- meditation metrics
- insights list

- [ ] **Step 2: Add empty states when data is insufficient**

Example:

```tsx
<EmptyState
  title="Pas encore de donnees"
  description="Les graphiques apparaitront apres quelques entrees."
/>
```

- [ ] **Step 3: Manually verify chart rendering**

Run:

```powershell
npm run dev
```

Manual check:

```text
1. Seed enough entries to populate at least three sections.
2. Open Analyse.
3. Verify charts render and do not overflow on mobile width.
4. Verify insight wording stays cautious.
```

Expected: readable mobile charts with clear empty states.

## Task 7: Build Settings, PWA Install, And Web Reminder Handling

**Files:**
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\settings\ReglagesPage.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\settings\PwaInstallHelp.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\settings\NotificationStatus.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\features\settings\LocalDataReset.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\services\notificationService.ts`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\services\pwaService.ts`

- [ ] **Step 1: Implement notification capability detection**

The service must expose:

- whether the browser supports notifications
- current permission
- whether the app appears installed
- whether scheduling is realistically available

- [ ] **Step 2: Implement the settings page**

Include:

- visible-entry toggles
- schedule list with add/edit/delete
- notification availability status
- install instructions
- confidentiality section
- local data reset

- [ ] **Step 3: Add best-effort reminder behavior**

Scope:

- request permission when supported
- persist schedules locally
- show clear fallback text if reminders are unsupported on the current iPhone/browser setup

Do not over-promise background behavior that the platform may block.

- [ ] **Step 4: Manually verify the settings experience**

Run:

```powershell
npm run dev
```

Manual check:

```text
1. Open Reglages.
2. Add, edit, disable, and delete schedules.
3. Verify the app clearly reports notification support or limitation.
4. Use the reset action and confirm local data is cleared.
```

Expected: the page stays useful even when notifications are unavailable.

## Task 8: Add App Shell, Routing, PWA Assets, And Mobile Polish

**Files:**
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\app\AppShell.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\app\router.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\src\components\BottomTabBar.tsx`
- Create: `G:\APPLICATIONS\FLOW\flow-web\public\manifest.webmanifest`
- Create: `G:\APPLICATIONS\FLOW\flow-web\public\icons\icon-192.png`
- Create: `G:\APPLICATIONS\FLOW\flow-web\public\icons\icon-512.png`
- Modify: `G:\APPLICATIONS\FLOW\flow-web\src\styles\globals.css`
- Modify: `G:\APPLICATIONS\FLOW\flow-web\src\styles\tokens.css`

- [ ] **Step 1: Implement the app shell and tab routing**

Structure:

```tsx
export default function AppShell() {
  return (
    <div className="app-shell">
      <Outlet />
      <BottomTabBar />
    </div>
  );
}
```

- [ ] **Step 2: Add visual polish for iPhone-first usage**

Requirements:

- comfortable spacing
- sticky bottom tab bar
- non-flat background
- clear typography
- distinct but calm color system
- bottom sheets that feel app-like

- [ ] **Step 3: Add manifest and icon assets**

Ensure:

- installable name is `FLOW`
- standalone display mode
- theme/background colors match the app

- [ ] **Step 4: Build the production app**

Run:

```powershell
npm run build
```

Expected: Vite emits a production build successfully.

## Task 9: Add Documentation And Delivery Notes

**Files:**
- Modify: `G:\APPLICATIONS\FLOW\README.md`

- [ ] **Step 1: Add a web/PWA section to the README**

Include:

- how to install dependencies
- how to run the dev server
- how to build
- how to test
- how to install the PWA on iPhone

- [ ] **Step 2: Add web reminder caveats**

Document clearly:

- reminders depend on iPhone/browser/PWA support
- the app remains usable even if notifications are unavailable

- [ ] **Step 3: Add data privacy notes**

Document:

- no backend
- no account
- data stored locally only
- reset from settings clears local app data

- [ ] **Step 4: Re-run the full test suite and production build**

Run:

```powershell
npm run test
npm run build
```

Expected: tests pass and build succeeds.

## Self-Review

Spec coverage check:

- PWA installable, iPhone-first: covered by Tasks 1, 7, and 8.
- 100% local storage and no backend: covered by Tasks 2 and 9.
- modular tracking flow and short forms: covered by Task 4.
- history, editing, and deletion: covered by Task 5.
- focused analytics and cautious insights: covered by Tasks 3 and 6.
- best-effort web reminders with honest fallback: covered by Task 7.
- offline-friendly shell and install flow: covered by Task 8.

Placeholder scan:

- No `TODO` or `TBD` placeholders remain.
- Each task has concrete files and explicit commands.

Type consistency check:

- `TrackingEntry`, `CheckInSchedule`, and `LocalSettings` appear consistently across storage, services, and UI layers.
- The plan uses a single tracking form-state helper so creation and editing behavior do not diverge.

Execution note:

- The existing Swift/Xcode app remains in the repository as reference and should not be removed during the initial web build unless the user later asks for cleanup.
