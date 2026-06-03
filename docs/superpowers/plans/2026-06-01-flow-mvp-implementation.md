# FLOW MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete local iPhone MVP of `FLOW` with modular spontaneous entries, ultra-simple scheduled check-ins, local notifications, history/editing, focused analytics, and cautious text insights.

**Architecture:** Start from a new SwiftUI iOS app targeting `iOS 17+`, use `SwiftData` for local persistence, keep a single flexible `TrackingEntry` model plus a `CheckInSchedule` model, and separate UI, business logic, notifications, analytics, and insight generation into focused files. Implement the app in thin vertical slices so each task ends in working software and verified tests.

**Tech Stack:** SwiftUI, SwiftData, Swift Charts, UserNotifications, XCTest

---

## File Structure

Planned project structure:

- Create: `G:\APPLICATIONS\FLOW\FLOW.xcodeproj`
- Create: `G:\APPLICATIONS\FLOW\FLOW\FLOWApp.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\EntryType.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\SourceType.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\MigraineLevel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\CaffeineLevel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\PhysicalActivityLevel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\MealType.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\ScreenTimeLevel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\TrackingEntry.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\CheckInSchedule.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\ViewModels\HomeViewModel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\ViewModels\EntryFormViewModel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\ViewModels\HistoryViewModel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\ViewModels\SettingsViewModel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Services\NotificationManager.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Services\AnalyticsService.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Services\InsightEngine.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Utilities\EntrySummaryBuilder.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Utilities\DateBucket.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Utilities\EntryDisplayConfig.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\RootTabView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\HomeView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\EntryFormView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\ScheduledCheckInView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\HistoryView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\EntryDetailView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\AnalyticsView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\SettingsView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\Components\QuickCheckInCard.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\Components\EntryTypeCardGrid.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\Components\EntryFieldSections.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\Components\FilterChipRow.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\Components\InsightCardView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOWTests\TrackingEntryTests.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOWTests\EntryFormViewModelTests.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOWTests\NotificationManagerTests.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOWTests\AnalyticsServiceTests.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOWTests\InsightEngineTests.swift`
- Create: `G:\APPLICATIONS\FLOW\README.md`

## Task 1: Bootstrap The Xcode Project

**Files:**
- Create: `G:\APPLICATIONS\FLOW\FLOW.xcodeproj`
- Create: `G:\APPLICATIONS\FLOW\FLOW\FLOWApp.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\RootTabView.swift`
- Create: `G:\APPLICATIONS\FLOW\README.md`

- [ ] **Step 1: Create a new iOS SwiftUI app named `FLOW`**

Use Xcode:

```text
Product Name: FLOW
Interface: SwiftUI
Language: Swift
Testing System: XCTest
Use SwiftData: enabled
Deployment Target: iOS 17.0
```

Expected project tree:

```text
FLOW/
  FLOW.xcodeproj
  FLOW/
    FLOWApp.swift
  FLOWTests/
  FLOWUITests/
```

- [ ] **Step 2: Replace the generated app entry with a root container that wires SwiftData**

```swift
import SwiftUI
import SwiftData

@main
struct FLOWApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            TrackingEntry.self,
            CheckInSchedule.self,
        ])

        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            fatalError("Unable to create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            RootTabView()
        }
        .modelContainer(sharedModelContainer)
    }
}
```

- [ ] **Step 3: Add a temporary root tab shell to confirm the app launches**

```swift
import SwiftUI

struct RootTabView: View {
    var body: some View {
        TabView {
            Text("Noter")
                .tabItem {
                    Label("Noter", systemImage: "square.and.pencil")
                }

            Text("Historique")
                .tabItem {
                    Label("Historique", systemImage: "clock")
                }

            Text("Analyse")
                .tabItem {
                    Label("Analyse", systemImage: "chart.line.uptrend.xyaxis")
                }

            Text("Reglages")
                .tabItem {
                    Label("Reglages", systemImage: "gearshape")
                }
        }
    }
}
```

- [ ] **Step 4: Add a minimal project README**

```md
# FLOW

Application iPhone locale de suivi energie, stress, fatigue et facteurs associes.

## Stack

- SwiftUI
- SwiftData
- Swift Charts
- UserNotifications
```

- [ ] **Step 5: Build the app to verify the project opens cleanly**

Run:

```powershell
xcodebuild -project FLOW.xcodeproj -scheme FLOW -destination "generic/platform=iOS Simulator" build
```

Expected: `** BUILD SUCCEEDED **`

- [ ] **Step 6: Commit**

```bash
git add FLOW.xcodeproj FLOW/FLOWApp.swift FLOW/Views/RootTabView.swift README.md
git commit -m "chore: bootstrap FLOW iOS project"
```

## Task 2: Define Models And Enums

**Files:**
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\EntryType.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\SourceType.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\MigraineLevel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\CaffeineLevel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\PhysicalActivityLevel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\MealType.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\ScreenTimeLevel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\TrackingEntry.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Models\CheckInSchedule.swift`
- Test: `G:\APPLICATIONS\FLOW\FLOWTests\TrackingEntryTests.swift`

- [ ] **Step 1: Write failing model tests for default behavior and cleanup expectations**

```swift
import XCTest
@testable import FLOW

final class TrackingEntryTests: XCTestCase {
    func testCheckInFactoryOnlyKeepsEnergyAndStress() {
        let entry = TrackingEntry.makeScheduledCheckIn(
            timestamp: .now,
            energyScore: 7,
            stressLevel: 4,
            notificationId: "checkin-0800"
        )

        XCTAssertEqual(entry.entryType, .checkIn)
        XCTAssertEqual(entry.sourceType, .scheduledCheckIn)
        XCTAssertEqual(entry.energyScore, 7)
        XCTAssertEqual(entry.stressLevel, 4)
        XCTAssertNil(entry.comment)
        XCTAssertNil(entry.sleepDuration)
        XCTAssertTrue(entry.completedFromNotification)
    }

    func testNormalizeClearsFieldsIrrelevantToEntryType() {
        let entry = TrackingEntry(
            timestamp: .now,
            entryType: .meditation,
            sourceType: .spontaneous
        )
        entry.energyScore = 5
        entry.stressLevel = 9
        entry.meditationDuration = 15
        entry.comment = "Calm"

        entry.normalizeForEntryType()

        XCTAssertNil(entry.energyScore)
        XCTAssertNil(entry.stressLevel)
        XCTAssertEqual(entry.meditationDuration, 15)
        XCTAssertEqual(entry.comment, "Calm")
    }
}
```

- [ ] **Step 2: Run model tests to verify they fail**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/TrackingEntryTests
```

Expected: FAIL with missing types and factory methods.

- [ ] **Step 3: Add the enum files**

```swift
import Foundation

enum EntryType: String, Codable, CaseIterable, Identifiable {
    case form
    case sleep
    case stress
    case mentalLoad
    case migraine
    case caffeine
    case physicalActivity
    case meal
    case nap
    case screenTime
    case medication
    case meditation
    case notableEvent
    case freeNote
    case checkIn

    var id: String { rawValue }
}
```

```swift
import Foundation

enum SourceType: String, Codable, CaseIterable, Identifiable {
    case spontaneous
    case scheduledCheckIn

    var id: String { rawValue }
}
```

Use the same pattern for the remaining enums, for example:

```swift
import Foundation

enum MigraineLevel: String, Codable, CaseIterable, Identifiable {
    case none
    case mild
    case moderate
    case severe

    var id: String { rawValue }
}
```

- [ ] **Step 4: Implement `TrackingEntry` and `CheckInSchedule`**

```swift
import Foundation
import SwiftData

@Model
final class TrackingEntry {
    var id: UUID
    var timestamp: Date
    var entryTypeRawValue: String
    var sourceTypeRawValue: String
    var notificationId: String?
    var scheduledTime: Date?
    var completedFromNotification: Bool

    var energyScore: Int?
    var sleepDuration: Double?
    var sleepQuality: Int?
    var stressLevel: Int?
    var mentalLoad: Int?
    var migraineLevelRawValue: String?
    var migrainePainScore: Int?
    var migraineMedicationTaken: Bool?
    var migraineMedicationNote: String?
    var caffeineLevelRawValue: String?
    var physicalActivityLevelRawValue: String?
    var mealTypeRawValue: String?
    var napDuration: Int?
    var screenTimeLevelRawValue: String?
    var medicationNote: String?
    var meditationDuration: Int?
    var eventNote: String?
    var freeNote: String?
    var comment: String?

    init(
        id: UUID = UUID(),
        timestamp: Date = .now,
        entryType: EntryType,
        sourceType: SourceType,
        notificationId: String? = nil,
        scheduledTime: Date? = nil,
        completedFromNotification: Bool = false
    ) {
        self.id = id
        self.timestamp = timestamp
        self.entryTypeRawValue = entryType.rawValue
        self.sourceTypeRawValue = sourceType.rawValue
        self.notificationId = notificationId
        self.scheduledTime = scheduledTime
        self.completedFromNotification = completedFromNotification
    }
}
```

Add computed enum wrappers and cleanup helpers:

```swift
extension TrackingEntry {
    var entryType: EntryType {
        get { EntryType(rawValue: entryTypeRawValue) ?? .freeNote }
        set { entryTypeRawValue = newValue.rawValue }
    }

    var sourceType: SourceType {
        get { SourceType(rawValue: sourceTypeRawValue) ?? .spontaneous }
        set { sourceTypeRawValue = newValue.rawValue }
    }

    static func makeScheduledCheckIn(
        timestamp: Date,
        energyScore: Int,
        stressLevel: Int,
        notificationId: String? = nil,
        scheduledTime: Date? = nil
    ) -> TrackingEntry {
        let entry = TrackingEntry(
            timestamp: timestamp,
            entryType: .checkIn,
            sourceType: .scheduledCheckIn,
            notificationId: notificationId,
            scheduledTime: scheduledTime,
            completedFromNotification: notificationId != nil
        )
        entry.energyScore = energyScore
        entry.stressLevel = stressLevel
        entry.normalizeForEntryType()
        return entry
    }

    func normalizeForEntryType() {
        switch entryType {
        case .checkIn:
            sleepDuration = nil
            sleepQuality = nil
            mentalLoad = nil
            migraineLevelRawValue = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevelRawValue = nil
            physicalActivityLevelRawValue = nil
            mealTypeRawValue = nil
            napDuration = nil
            screenTimeLevelRawValue = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
            comment = nil
        case .meditation:
            energyScore = nil
            stressLevel = nil
            sleepDuration = nil
            sleepQuality = nil
            mentalLoad = nil
            migraineLevelRawValue = nil
            migrainePainScore = nil
        default:
            break
        }
    }
}
```

And the schedule model:

```swift
import Foundation
import SwiftData

@Model
final class CheckInSchedule {
    var id: UUID
    var time: Date
    var isEnabled: Bool
    var title: String?

    init(id: UUID = UUID(), time: Date, isEnabled: Bool = true, title: String? = nil) {
        self.id = id
        self.time = time
        self.isEnabled = isEnabled
        self.title = title
    }
}
```

- [ ] **Step 5: Run model tests to verify they pass**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/TrackingEntryTests
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add FLOW/Models FLOWTests/TrackingEntryTests.swift
git commit -m "feat: add FLOW data models and enums"
```

## Task 3: Build Shared Utilities And Display Metadata

**Files:**
- Create: `G:\APPLICATIONS\FLOW\FLOW\Utilities\EntryDisplayConfig.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Utilities\EntrySummaryBuilder.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Utilities\DateBucket.swift`
- Test: `G:\APPLICATIONS\FLOW\FLOWTests\TrackingEntryTests.swift`

- [ ] **Step 1: Add failing tests for summary rendering**

```swift
func testSummaryForCheckInIncludesEnergyAndStress() {
    let entry = TrackingEntry.makeScheduledCheckIn(
        timestamp: .now,
        energyScore: 6,
        stressLevel: 3
    )

    let summary = EntrySummaryBuilder.summary(for: entry)

    XCTAssertEqual(summary, "Energie 6/10 · Stress 3/10")
}
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/TrackingEntryTests/testSummaryForCheckInIncludesEnergyAndStress
```

Expected: FAIL with unknown summary builder.

- [ ] **Step 3: Implement entry display metadata**

```swift
import Foundation

struct EntryDisplayConfig {
    let title: String
    let systemImage: String

    static func config(for type: EntryType) -> EntryDisplayConfig {
        switch type {
        case .form: return .init(title: "Forme", systemImage: "sun.max")
        case .sleep: return .init(title: "Sommeil", systemImage: "bed.double")
        case .stress: return .init(title: "Stress", systemImage: "bolt.heart")
        case .mentalLoad: return .init(title: "Charge mentale", systemImage: "brain.head.profile")
        case .migraine: return .init(title: "Migraine", systemImage: "head.side")
        case .caffeine: return .init(title: "Cafeine", systemImage: "cup.and.saucer")
        case .physicalActivity: return .init(title: "Activite physique", systemImage: "figure.walk")
        case .meal: return .init(title: "Repas", systemImage: "fork.knife")
        case .nap: return .init(title: "Sieste", systemImage: "moon.zzz")
        case .screenTime: return .init(title: "Temps d'ecran", systemImage: "iphone")
        case .medication: return .init(title: "Medicament", systemImage: "pills")
        case .meditation: return .init(title: "Meditation", systemImage: "sparkles")
        case .notableEvent: return .init(title: "Evenement particulier", systemImage: "star.bubble")
        case .freeNote: return .init(title: "Note libre", systemImage: "note.text")
        case .checkIn: return .init(title: "Check-in", systemImage: "waveform.path.ecg")
        }
    }
}
```

- [ ] **Step 4: Implement summary and date helpers**

```swift
import Foundation

enum EntrySummaryBuilder {
    static func summary(for entry: TrackingEntry) -> String {
        switch entry.entryType {
        case .checkIn:
            let energy = entry.energyScore.map { "Energie \($0)/10" } ?? "Energie -"
            let stress = entry.stressLevel.map { "Stress \($0)/10" } ?? "Stress -"
            return "\(energy) · \(stress)"
        case .sleep:
            return "Sommeil \(entry.sleepDuration ?? 0, specifier: "%.1f") h"
        case .migraine:
            return "Douleur \(entry.migrainePainScore ?? 0)/10"
        case .freeNote:
            return entry.freeNote ?? "Note"
        default:
            return entry.comment ?? EntryDisplayConfig.config(for: entry.entryType).title
        }
    }
}
```

```swift
import Foundation

enum DateBucket {
    static let calendar = Calendar.current

    static func startOfDay(for date: Date) -> Date {
        calendar.startOfDay(for: date)
    }

    static func hourComponent(for date: Date) -> Int {
        calendar.component(.hour, from: date)
    }
}
```

- [ ] **Step 5: Run tests again**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/TrackingEntryTests
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add FLOW/Utilities FLOWTests/TrackingEntryTests.swift
git commit -m "feat: add entry display metadata and summaries"
```

## Task 4: Implement Form State And Validation

**Files:**
- Create: `G:\APPLICATIONS\FLOW\FLOW\ViewModels\EntryFormViewModel.swift`
- Test: `G:\APPLICATIONS\FLOW\FLOWTests\EntryFormViewModelTests.swift`

- [ ] **Step 1: Write failing tests for form validation**

```swift
import XCTest
@testable import FLOW

final class EntryFormViewModelTests: XCTestCase {
    func testScheduledCheckInRequiresEnergyAndStress() {
        let viewModel = EntryFormViewModel(entryType: .checkIn, sourceType: .scheduledCheckIn)

        XCTAssertFalse(viewModel.canSave)

        viewModel.energyScore = 8
        viewModel.stressLevel = 2

        XCTAssertTrue(viewModel.canSave)
    }

    func testMigraineRequiresMeaningfulData() {
        let viewModel = EntryFormViewModel(entryType: .migraine, sourceType: .spontaneous)

        XCTAssertFalse(viewModel.canSave)

        viewModel.migrainePainScore = 6

        XCTAssertTrue(viewModel.canSave)
    }
}
```

- [ ] **Step 2: Run form tests to verify they fail**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/EntryFormViewModelTests
```

Expected: FAIL with missing view model.

- [ ] **Step 3: Implement the form view model**

```swift
import Foundation

@Observable
final class EntryFormViewModel {
    let entryType: EntryType
    let sourceType: SourceType

    var timestamp: Date
    var energyScore: Int?
    var sleepDuration: Double?
    var sleepQuality: Int?
    var stressLevel: Int?
    var mentalLoad: Int?
    var migraineLevel: MigraineLevel?
    var migrainePainScore: Int?
    var migraineMedicationTaken: Bool?
    var migraineMedicationNote: String = ""
    var caffeineLevel: CaffeineLevel?
    var physicalActivityLevel: PhysicalActivityLevel?
    var mealType: MealType?
    var napDuration: Int?
    var screenTimeLevel: ScreenTimeLevel?
    var medicationNote: String = ""
    var meditationDuration: Int?
    var eventNote: String = ""
    var freeNote: String = ""
    var comment: String = ""

    init(entryType: EntryType, sourceType: SourceType, timestamp: Date = .now) {
        self.entryType = entryType
        self.sourceType = sourceType
        self.timestamp = timestamp
    }
}
```

Add validation and build methods:

```swift
extension EntryFormViewModel {
    var canSave: Bool {
        switch entryType {
        case .checkIn:
            return energyScore != nil && stressLevel != nil
        case .migraine:
            return migraineLevel != nil || migrainePainScore != nil || !comment.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        case .meditation:
            return (meditationDuration ?? 0) > 0
        case .freeNote:
            return !freeNote.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        default:
            return true
        }
    }

    func buildEntry(existing: TrackingEntry? = nil) -> TrackingEntry {
        let entry = existing ?? TrackingEntry(timestamp: timestamp, entryType: entryType, sourceType: sourceType)
        entry.timestamp = timestamp
        entry.entryType = entryType
        entry.sourceType = sourceType
        entry.energyScore = energyScore
        entry.sleepDuration = sleepDuration
        entry.sleepQuality = sleepQuality
        entry.stressLevel = stressLevel
        entry.mentalLoad = mentalLoad
        entry.migrainePainScore = migrainePainScore
        entry.migraineMedicationTaken = migraineMedicationTaken
        entry.migraineMedicationNote = migraineMedicationNote.nilIfBlank
        entry.napDuration = napDuration
        entry.medicationNote = medicationNote.nilIfBlank
        entry.meditationDuration = meditationDuration
        entry.eventNote = eventNote.nilIfBlank
        entry.freeNote = freeNote.nilIfBlank
        entry.comment = comment.nilIfBlank
        entry.normalizeForEntryType()
        return entry
    }
}

private extension String {
    var nilIfBlank: String? {
        let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
```

- [ ] **Step 4: Run the form tests to verify they pass**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/EntryFormViewModelTests
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add FLOW/ViewModels/EntryFormViewModel.swift FLOWTests/EntryFormViewModelTests.swift
git commit -m "feat: add entry form validation and mapping"
```

## Task 5: Build The Home Experience And Dynamic Entry Form

**Files:**
- Create: `G:\APPLICATIONS\FLOW\FLOW\ViewModels\HomeViewModel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\HomeView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\EntryFormView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\Components\QuickCheckInCard.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\Components\EntryTypeCardGrid.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\Components\EntryFieldSections.swift`
- Modify: `G:\APPLICATIONS\FLOW\FLOW\Views\RootTabView.swift`

- [ ] **Step 1: Add a failing smoke test for quick check-in save logic**

```swift
func testQuickCheckInSaveCreatesScheduledCheckInEntry() {
    let viewModel = HomeViewModel()

    viewModel.quickCheckInEnergy = 7
    viewModel.quickCheckInStress = 5

    let entry = viewModel.makeQuickCheckInEntry()

    XCTAssertEqual(entry.entryType, .checkIn)
    XCTAssertEqual(entry.sourceType, .scheduledCheckIn)
    XCTAssertEqual(entry.energyScore, 7)
    XCTAssertEqual(entry.stressLevel, 5)
}
```

- [ ] **Step 2: Run the quick check-in test to verify it fails**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/EntryFormViewModelTests/testQuickCheckInSaveCreatesScheduledCheckInEntry
```

Expected: FAIL with missing home view model.

- [ ] **Step 3: Implement the home view model**

```swift
import Foundation

@Observable
final class HomeViewModel {
    var quickCheckInEnergy: Int = 5
    var quickCheckInStress: Int = 5
    var selectedEntryType: EntryType?

    let availableEntryTypes: [EntryType] = [
        .form, .sleep, .stress, .mentalLoad, .migraine, .caffeine,
        .physicalActivity, .meal, .nap, .screenTime, .medication,
        .meditation, .notableEvent, .freeNote
    ]

    func makeQuickCheckInEntry() -> TrackingEntry {
        TrackingEntry.makeScheduledCheckIn(
            timestamp: .now,
            energyScore: quickCheckInEnergy,
            stressLevel: quickCheckInStress
        )
    }
}
```

- [ ] **Step 4: Implement the reusable home components**

```swift
import SwiftUI

struct QuickCheckInCard: View {
    @Binding var energy: Int
    @Binding var stress: Int
    let onSave: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Check-in rapide")
                .font(.headline)

            Stepper("Energie: \(energy)/10", value: $energy, in: 1...10)
            Stepper("Stress: \(stress)/10", value: $stress, in: 1...10)

            Button("Enregistrer", action: onSave)
                .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20))
    }
}
```

```swift
import SwiftUI

struct EntryTypeCardGrid: View {
    let entryTypes: [EntryType]
    let onSelect: (EntryType) -> Void

    private let columns = [GridItem(.adaptive(minimum: 140), spacing: 12)]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            ForEach(entryTypes) { type in
                let config = EntryDisplayConfig.config(for: type)
                Button {
                    onSelect(type)
                } label: {
                    VStack(alignment: .leading, spacing: 10) {
                        Image(systemName: config.systemImage)
                            .font(.title2)
                        Text(config.title)
                            .font(.headline)
                            .multilineTextAlignment(.leading)
                    }
                    .frame(maxWidth: .infinity, minHeight: 96, alignment: .leading)
                    .padding()
                }
                .buttonStyle(.bordered)
            }
        }
    }
}
```

- [ ] **Step 5: Implement the dynamic form sections and home screen**

```swift
import SwiftUI
import SwiftData

struct HomeView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = HomeViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    QuickCheckInCard(
                        energy: $viewModel.quickCheckInEnergy,
                        stress: $viewModel.quickCheckInStress
                    ) {
                        modelContext.insert(viewModel.makeQuickCheckInEntry())
                        try? modelContext.save()
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Entrees spontanees")
                            .font(.title3.weight(.semibold))
                        EntryTypeCardGrid(entryTypes: viewModel.availableEntryTypes) { type in
                            viewModel.selectedEntryType = type
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("FLOW")
            .sheet(item: $viewModel.selectedEntryType) { entryType in
                EntryFormView(entryType: entryType, sourceType: .spontaneous)
            }
        }
    }
}
```

`EntryFormView.swift` should render only relevant controls:

```swift
import SwiftUI
import SwiftData

struct EntryFormView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel: EntryFormViewModel

    init(entryType: EntryType, sourceType: SourceType, existingEntry: TrackingEntry? = nil) {
        _viewModel = State(initialValue: EntryFormViewModel(entryType: entryType, sourceType: sourceType))
    }

    var body: some View {
        NavigationStack {
            Form {
                EntryFieldSections(viewModel: viewModel)
            }
            .navigationTitle(EntryDisplayConfig.config(for: viewModel.entryType).title)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Annuler") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Enregistrer") {
                        let entry = viewModel.buildEntry()
                        modelContext.insert(entry)
                        try? modelContext.save()
                        dismiss()
                    }
                    .disabled(!viewModel.canSave)
                }
            }
        }
    }
}
```

- [ ] **Step 6: Update the root tab to use the real home view**

```swift
import SwiftUI

struct RootTabView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("Noter", systemImage: "square.and.pencil")
                }

            Text("Historique")
                .tabItem {
                    Label("Historique", systemImage: "clock")
                }

            Text("Analyse")
                .tabItem {
                    Label("Analyse", systemImage: "chart.line.uptrend.xyaxis")
                }

            Text("Reglages")
                .tabItem {
                    Label("Reglages", systemImage: "gearshape")
                }
        }
    }
}
```

- [ ] **Step 7: Build and manually verify the home flow**

Run:

```powershell
xcodebuild -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" build
```

Manual check:

```text
1. Launch app in iPhone simulator.
2. Confirm the "Noter" tab shows the quick check-in card and category grid.
3. Save a quick check-in.
4. Open at least two category forms and confirm the fields are category-specific.
```

Expected: build succeeds and forms stay short.

- [ ] **Step 8: Commit**

```bash
git add FLOW/ViewModels/HomeViewModel.swift FLOW/Views
git commit -m "feat: add home screen and dynamic entry forms"
```

## Task 6: Add Scheduled Check-In Notification Flow

**Files:**
- Create: `G:\APPLICATIONS\FLOW\FLOW\Services\NotificationManager.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\ScheduledCheckInView.swift`
- Test: `G:\APPLICATIONS\FLOW\FLOWTests\NotificationManagerTests.swift`
- Modify: `G:\APPLICATIONS\FLOW\FLOW\FLOWApp.swift`

- [ ] **Step 1: Write failing tests for notification request generation**

```swift
import XCTest
@testable import FLOW

final class NotificationManagerTests: XCTestCase {
    func testRequestIdentifiersMatchScheduleIds() {
        let schedule = CheckInSchedule(
            id: UUID(uuidString: "11111111-1111-1111-1111-111111111111")!,
            time: Date(timeIntervalSince1970: 0),
            isEnabled: true
        )

        let requests = NotificationManager.makeRequests(for: [schedule])

        XCTAssertEqual(requests.count, 1)
        XCTAssertEqual(requests[0].identifier, "checkin-11111111-1111-1111-1111-111111111111")
    }
}
```

- [ ] **Step 2: Run notification tests to verify they fail**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/NotificationManagerTests
```

Expected: FAIL with missing notification manager.

- [ ] **Step 3: Implement the notification manager**

```swift
import Foundation
import UserNotifications

@MainActor
final class NotificationManager: NSObject, ObservableObject {
    static let shared = NotificationManager()

    @Published private(set) var authorizationStatus: UNAuthorizationStatus = .notDetermined

    func refreshAuthorizationStatus() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        authorizationStatus = settings.authorizationStatus
    }

    func requestAuthorization() async throws {
        try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound])
        await refreshAuthorizationStatus()
    }

    static func makeRequests(for schedules: [CheckInSchedule]) -> [UNNotificationRequest] {
        schedules
            .filter(\.isEnabled)
            .map { schedule in
                let content = UNMutableNotificationContent()
                content.title = "FLOW"
                content.body = "Comment est ton energie maintenant ?"
                content.sound = .default
                content.userInfo = ["notificationKind": "scheduledCheckIn", "scheduleId": schedule.id.uuidString]

                let components = Calendar.current.dateComponents([.hour, .minute], from: schedule.time)
                let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
                return UNNotificationRequest(
                    identifier: "checkin-\(schedule.id.uuidString)",
                    content: content,
                    trigger: trigger
                )
            }
    }
}
```

- [ ] **Step 4: Implement the dedicated scheduled check-in view**

```swift
import SwiftUI
import SwiftData

struct ScheduledCheckInView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var energyScore: Int = 5
    @State private var stressLevel: Int = 5

    let notificationId: String?
    let scheduledTime: Date?

    var body: some View {
        NavigationStack {
            Form {
                Stepper("Energie: \(energyScore)/10", value: $energyScore, in: 1...10)
                Stepper("Stress: \(stressLevel)/10", value: $stressLevel, in: 1...10)
            }
            .navigationTitle("Check-in")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Enregistrer") {
                        let entry = TrackingEntry.makeScheduledCheckIn(
                            timestamp: .now,
                            energyScore: energyScore,
                            stressLevel: stressLevel,
                            notificationId: notificationId,
                            scheduledTime: scheduledTime
                        )
                        modelContext.insert(entry)
                        try? modelContext.save()
                        dismiss()
                    }
                }
            }
        }
    }
}
```

- [ ] **Step 5: Wire notification handling into the app root**

```swift
import SwiftUI
import SwiftData
import UserNotifications

@main
struct FLOWApp: App {
    @State private var pendingScheduledCheckIn: PendingScheduledCheckIn?

    var body: some Scene {
        WindowGroup {
            RootTabView(pendingScheduledCheckIn: $pendingScheduledCheckIn)
        }
        .modelContainer(sharedModelContainer)
    }
}

struct PendingScheduledCheckIn: Identifiable {
    let id = UUID()
    let notificationId: String?
    let scheduledTime: Date?
}
```

- [ ] **Step 6: Run notification tests and do a manual notification smoke test**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/NotificationManagerTests
```

Manual check:

```text
1. Seed a schedule for one minute ahead.
2. Launch app in simulator.
3. Allow notifications.
4. Confirm tapping the notification opens the two-field check-in screen.
```

Expected: tests pass and only two fields show.

- [ ] **Step 7: Commit**

```bash
git add FLOW/Services/NotificationManager.swift FLOW/Views/ScheduledCheckInView.swift FLOW/FLOWApp.swift FLOWTests/NotificationManagerTests.swift
git commit -m "feat: add scheduled check-in notifications"
```

## Task 7: Build History, Detail, Editing, And Deletion

**Files:**
- Create: `G:\APPLICATIONS\FLOW\FLOW\ViewModels\HistoryViewModel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\HistoryView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\EntryDetailView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\Components\FilterChipRow.swift`
- Modify: `G:\APPLICATIONS\FLOW\FLOW\Views\EntryFormView.swift`
- Modify: `G:\APPLICATIONS\FLOW\FLOW\Views\RootTabView.swift`

- [ ] **Step 1: Write a failing test for editable form prefill**

```swift
func testBuildEntryUpdatesExistingObject() {
    let existing = TrackingEntry(timestamp: .now, entryType: .form, sourceType: .spontaneous)
    existing.energyScore = 3

    let viewModel = EntryFormViewModel(entryType: .form, sourceType: .spontaneous)
    viewModel.energyScore = 8
    let updated = viewModel.buildEntry(existing: existing)

    XCTAssertTrue(existing === updated)
    XCTAssertEqual(updated.energyScore, 8)
}
```

- [ ] **Step 2: Run the focused edit test**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/EntryFormViewModelTests/testBuildEntryUpdatesExistingObject
```

Expected: FAIL if editing support is not complete.

- [ ] **Step 3: Add filtering and detail view models**

```swift
import Foundation

@Observable
final class HistoryViewModel {
    var selectedEntryType: EntryType?
    var selectedSourceType: SourceType?

    func matches(_ entry: TrackingEntry) -> Bool {
        let matchesType = selectedEntryType == nil || entry.entryType == selectedEntryType
        let matchesSource = selectedSourceType == nil || entry.sourceType == selectedSourceType
        return matchesType && matchesSource
    }
}
```

- [ ] **Step 4: Implement `HistoryView` and `EntryDetailView`**

```swift
import SwiftUI
import SwiftData

struct HistoryView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \TrackingEntry.timestamp, order: .reverse) private var entries: [TrackingEntry]
    @State private var viewModel = HistoryViewModel()

    var filteredEntries: [TrackingEntry] {
        entries.filter(viewModel.matches)
    }

    var body: some View {
        NavigationStack {
            List {
                ForEach(filteredEntries) { entry in
                    NavigationLink {
                        EntryDetailView(entry: entry)
                    } label: {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(EntryDisplayConfig.config(for: entry.entryType).title)
                                .font(.headline)
                            Text(EntrySummaryBuilder.summary(for: entry))
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .onDelete { offsets in
                    offsets.map { filteredEntries[$0] }.forEach(modelContext.delete)
                    try? modelContext.save()
                }
            }
            .navigationTitle("Historique")
        }
    }
}
```

```swift
import SwiftUI

struct EntryDetailView: View {
    let entry: TrackingEntry
    @State private var isEditing = false

    var body: some View {
        List {
            Section("Type") {
                Text(EntryDisplayConfig.config(for: entry.entryType).title)
                Text(EntrySummaryBuilder.summary(for: entry))
            }
        }
        .navigationTitle("Detail")
        .toolbar {
            Button("Modifier") { isEditing = true }
        }
        .sheet(isPresented: $isEditing) {
            EntryFormView(
                entryType: entry.entryType,
                sourceType: entry.sourceType,
                existingEntry: entry
            )
        }
    }
}
```

- [ ] **Step 5: Update `EntryFormView` to support editing existing entries**

```swift
init(entryType: EntryType, sourceType: SourceType, existingEntry: TrackingEntry? = nil) {
    let viewModel = EntryFormViewModel(entryType: entryType, sourceType: sourceType)
    if let existingEntry {
        viewModel.timestamp = existingEntry.timestamp
        viewModel.energyScore = existingEntry.energyScore
        viewModel.stressLevel = existingEntry.stressLevel
        viewModel.sleepDuration = existingEntry.sleepDuration
        viewModel.sleepQuality = existingEntry.sleepQuality
        viewModel.mentalLoad = existingEntry.mentalLoad
        viewModel.migrainePainScore = existingEntry.migrainePainScore
        viewModel.migraineMedicationTaken = existingEntry.migraineMedicationTaken
        viewModel.migraineMedicationNote = existingEntry.migraineMedicationNote ?? ""
        viewModel.comment = existingEntry.comment ?? ""
        viewModel.freeNote = existingEntry.freeNote ?? ""
        viewModel.eventNote = existingEntry.eventNote ?? ""
    }
    _viewModel = State(initialValue: viewModel)
    self.existingEntry = existingEntry
}
```

- [ ] **Step 6: Replace placeholder history tab and manually verify editing**

```swift
HistoryView()
    .tabItem {
        Label("Historique", systemImage: "clock")
    }
```

Manual check:

```text
1. Create three different entries.
2. Open Historique.
3. Filter by type and source.
4. Open one entry, edit it, save it, and confirm the list updates.
5. Delete one entry and confirm it disappears.
```

- [ ] **Step 7: Commit**

```bash
git add FLOW/ViewModels/HistoryViewModel.swift FLOW/Views/HistoryView.swift FLOW/Views/EntryDetailView.swift FLOW/Views/EntryFormView.swift
git commit -m "feat: add history, detail, and entry editing"
```

## Task 8: Add Settings And Schedule Management

**Files:**
- Create: `G:\APPLICATIONS\FLOW\FLOW\ViewModels\SettingsViewModel.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\SettingsView.swift`
- Modify: `G:\APPLICATIONS\FLOW\FLOW\Services\NotificationManager.swift`
- Modify: `G:\APPLICATIONS\FLOW\FLOW\Views\RootTabView.swift`

- [ ] **Step 1: Write a failing test for default schedules**

```swift
func testDefaultSchedulesCreateFourTimes() {
    let schedules = SettingsViewModel.makeDefaultSchedules(referenceDate: Date(timeIntervalSince1970: 0))

    XCTAssertEqual(schedules.count, 4)
}
```

- [ ] **Step 2: Run the settings test to verify it fails**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/EntryFormViewModelTests/testDefaultSchedulesCreateFourTimes
```

Expected: FAIL with missing settings model.

- [ ] **Step 3: Implement the settings view model**

```swift
import Foundation

@Observable
final class SettingsViewModel {
    static func makeDefaultSchedules(referenceDate: Date = .now) -> [CheckInSchedule] {
        let calendar = Calendar.current
        return [(8, 0), (12, 0), (16, 0), (20, 0)].compactMap { hour, minute in
            let date = calendar.date(bySettingHour: hour, minute: minute, second: 0, of: referenceDate)
            return date.map { CheckInSchedule(time: $0, isEnabled: true) }
        }
    }
}
```

- [ ] **Step 4: Implement `SettingsView`**

```swift
import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \CheckInSchedule.time) private var schedules: [CheckInSchedule]
    @StateObject private var notificationManager = NotificationManager.shared

    var body: some View {
        NavigationStack {
            List {
                Section("Confidentialite") {
                    Text("Toutes les donnees restent stockees localement sur cet iPhone.")
                }

                Section("Notifications") {
                    Button("Autoriser les notifications") {
                        Task { try? await notificationManager.requestAuthorization() }
                    }

                    ForEach(schedules) { schedule in
                        Toggle(isOn: Bindable(schedule).isEnabled) {
                            Text(schedule.time.formatted(date: .omitted, time: .shortened))
                        }
                    }
                    .onDelete { offsets in
                        offsets.map { schedules[$0] }.forEach(modelContext.delete)
                        try? modelContext.save()
                    }
                }

                Section("Bientot disponible") {
                    Text("Export CSV")
                    Text("Synchronisation iCloud")
                }
            }
            .navigationTitle("Reglages")
        }
    }
}
```

- [ ] **Step 5: Replace the settings tab and seed schedules once**

```swift
SettingsView()
    .tabItem {
        Label("Reglages", systemImage: "gearshape")
    }
```

Seed example inside app startup:

```swift
let descriptor = FetchDescriptor<CheckInSchedule>()
if try container.mainContext.fetchCount(descriptor) == 0 {
    SettingsViewModel.makeDefaultSchedules().forEach { container.mainContext.insert($0) }
    try container.mainContext.save()
}
```

- [ ] **Step 6: Build and manually verify settings behavior**

Run:

```powershell
xcodebuild -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" build
```

Manual check:

```text
1. Confirm four default schedules appear.
2. Disable one schedule and relaunch the app.
3. Confirm the schedule persists.
4. Add and delete a custom schedule.
```

Expected: schedule persistence works and settings remain local.

- [ ] **Step 7: Commit**

```bash
git add FLOW/ViewModels/SettingsViewModel.swift FLOW/Views/SettingsView.swift FLOW/Views/RootTabView.swift FLOW/Services/NotificationManager.swift FLOW/FLOWApp.swift
git commit -m "feat: add settings and schedule management"
```

## Task 9: Implement Analytics Calculations

**Files:**
- Create: `G:\APPLICATIONS\FLOW\FLOW\Services\AnalyticsService.swift`
- Test: `G:\APPLICATIONS\FLOW\FLOWTests\AnalyticsServiceTests.swift`

- [ ] **Step 1: Write failing tests for key analytics aggregates**

```swift
import XCTest
@testable import FLOW

final class AnalyticsServiceTests: XCTestCase {
    func testAverageEnergyByHourUsesScheduledCheckInsOnly() {
        let checkInA = TrackingEntry.makeScheduledCheckIn(timestamp: date(hour: 8), energyScore: 6, stressLevel: 4)
        let checkInB = TrackingEntry.makeScheduledCheckIn(timestamp: date(hour: 8), energyScore: 8, stressLevel: 3)
        let formEntry = TrackingEntry(timestamp: date(hour: 8), entryType: .form, sourceType: .spontaneous)
        formEntry.energyScore = 2

        let result = AnalyticsService.averageEnergyByHour(entries: [checkInA, checkInB, formEntry])

        XCTAssertEqual(result, [(hour: 8, average: 7.0)])
    }

    private func date(hour: Int) -> Date {
        Calendar.current.date(bySettingHour: hour, minute: 0, second: 0, of: .now)!
    }
}
```

- [ ] **Step 2: Run analytics tests to verify they fail**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/AnalyticsServiceTests
```

Expected: FAIL with missing analytics service.

- [ ] **Step 3: Implement analytics helpers**

```swift
import Foundation

enum AnalyticsService {
    static func scheduledCheckIns(from entries: [TrackingEntry]) -> [TrackingEntry] {
        entries.filter { $0.entryType == .checkIn && $0.sourceType == .scheduledCheckIn }
    }

    static func averageEnergyByHour(entries: [TrackingEntry]) -> [(hour: Int, average: Double)] {
        let grouped = Dictionary(grouping: scheduledCheckIns(from: entries)) { DateBucket.hourComponent(for: $0.timestamp) }
        return grouped
            .compactMap { hour, values in
                let scores = values.compactMap(\.energyScore)
                guard !scores.isEmpty else { return nil }
                return (hour: hour, average: Double(scores.reduce(0, +)) / Double(scores.count))
            }
            .sorted { $0.hour < $1.hour }
    }

    static func averageStressByHour(entries: [TrackingEntry]) -> [(hour: Int, average: Double)] {
        let grouped = Dictionary(grouping: scheduledCheckIns(from: entries)) { DateBucket.hourComponent(for: $0.timestamp) }
        return grouped
            .compactMap { hour, values in
                let scores = values.compactMap(\.stressLevel)
                guard !scores.isEmpty else { return nil }
                return (hour: hour, average: Double(scores.reduce(0, +)) / Double(scores.count))
            }
            .sorted { $0.hour < $1.hour }
    }
}
```

Extend with focused MVP helpers:

```swift
extension AnalyticsService {
    static func dailyFormAverage(entries: [TrackingEntry]) -> [(day: Date, average: Double)] {
        let formEntries = entries.filter { $0.entryType == .form }
        let grouped = Dictionary(grouping: formEntries) { DateBucket.startOfDay(for: $0.timestamp) }
        return grouped.compactMap { day, values in
            let scores = values.compactMap(\.energyScore)
            guard !scores.isEmpty else { return nil }
            return (day: day, average: Double(scores.reduce(0, +)) / Double(scores.count))
        }
        .sorted { $0.day < $1.day }
    }
}
```

- [ ] **Step 4: Run analytics tests to verify they pass**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/AnalyticsServiceTests
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add FLOW/Services/AnalyticsService.swift FLOWTests/AnalyticsServiceTests.swift
git commit -m "feat: add analytics calculations"
```

## Task 10: Build Analytics UI And Insights

**Files:**
- Create: `G:\APPLICATIONS\FLOW\FLOW\Services\InsightEngine.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\AnalyticsView.swift`
- Create: `G:\APPLICATIONS\FLOW\FLOW\Views\Components\InsightCardView.swift`
- Test: `G:\APPLICATIONS\FLOW\FLOWTests\InsightEngineTests.swift`
- Modify: `G:\APPLICATIONS\FLOW\FLOW\Views\RootTabView.swift`

- [ ] **Step 1: Write failing tests for cautious insight wording**

```swift
import XCTest
@testable import FLOW

final class InsightEngineTests: XCTestCase {
    func testLowSleepInsightUsesCautiousLanguage() {
        let entries = [
            makeSleepEntry(hours: 5.0, quality: 4),
            makeFormEntry(score: 3),
            makeSleepEntry(hours: 8.0, quality: 8),
            makeFormEntry(score: 8),
        ]

        let insights = InsightEngine.generateInsights(entries: entries)

        XCTAssertTrue(insights.contains { $0.contains("semblent associes") || $0.contains("semble associe") })
    }
}
```

- [ ] **Step 2: Run insight tests to verify they fail**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/InsightEngineTests
```

Expected: FAIL with missing insight engine.

- [ ] **Step 3: Implement the insight engine**

```swift
import Foundation

enum InsightEngine {
    static func generateInsights(entries: [TrackingEntry]) -> [String] {
        var insights: [String] = []

        let checkIns = AnalyticsService.scheduledCheckIns(from: entries)
        let averageByHour = AnalyticsService.averageEnergyByHour(entries: checkIns)

        if let lowest = averageByHour.min(by: { $0.average < $1.average }), averageByHour.count >= 3 {
            insights.append("Tu sembles plus fatiguee vers \(lowest.hour)h.")
        }

        let lowSleep = entries.filter { $0.entryType == .sleep && ($0.sleepDuration ?? 0) < 6 }
        let higherSleep = entries.filter { $0.entryType == .sleep && ($0.sleepDuration ?? 0) >= 6 }

        if !lowSleep.isEmpty && !higherSleep.isEmpty {
            insights.append("Les jours avec moins de 6h de sommeil semblent associes a une baisse d'energie.")
        }

        let migraines = entries.filter { $0.entryType == .migraine && ($0.migrainePainScore ?? 0) >= 1 }
        let highStress = entries.filter { ($0.stressLevel ?? 0) >= 7 }
        if !migraines.isEmpty && !highStress.isEmpty {
            insights.append("Les migraines semblent plus frequentes quand le stress est eleve.")
        }

        if insights.isEmpty {
            insights.append("Pas assez de donnees pour afficher des tendances fiables pour le moment.")
        }

        return insights
    }
}
```

- [ ] **Step 4: Implement the analytics screen**

```swift
import SwiftUI
import SwiftData
import Charts

struct AnalyticsView: View {
    @Query(sort: \TrackingEntry.timestamp, order: .forward) private var entries: [TrackingEntry]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Text("Check-ins programmes")
                        .font(.title3.weight(.semibold))

                    Chart(AnalyticsService.averageEnergyByHour(entries: entries), id: \.hour) { item in
                        BarMark(
                            x: .value("Heure", item.hour),
                            y: .value("Energie moyenne", item.average)
                        )
                    }
                    .frame(height: 220)

                    Text("Insights")
                        .font(.title3.weight(.semibold))

                    ForEach(InsightEngine.generateInsights(entries: entries), id: \.self) { insight in
                        InsightCardView(text: insight)
                    }
                }
                .padding()
            }
            .navigationTitle("Analyse")
        }
    }
}
```

- [ ] **Step 5: Replace the analysis tab and manually verify charts**

```swift
AnalyticsView()
    .tabItem {
        Label("Analyse", systemImage: "chart.line.uptrend.xyaxis")
    }
```

Manual check:

```text
1. Seed multiple check-ins at different hours.
2. Add form, sleep, and migraine entries.
3. Confirm the charts render without crashing.
4. Confirm insight cards use cautious wording.
5. Confirm the empty state appears when data is too sparse.
```

- [ ] **Step 6: Run the insight tests**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16" -only-testing:FLOWTests/InsightEngineTests -only-testing:FLOWTests/AnalyticsServiceTests
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add FLOW/Services/InsightEngine.swift FLOW/Views/AnalyticsView.swift FLOW/Views/Components/InsightCardView.swift FLOW/Views/RootTabView.swift FLOWTests/InsightEngineTests.swift
git commit -m "feat: add analytics dashboard and insights"
```

## Task 11: Polish Empty States, Persistence, And Main-Tab Integration

**Files:**
- Modify: `G:\APPLICATIONS\FLOW\FLOW\Views\RootTabView.swift`
- Modify: `G:\APPLICATIONS\FLOW\FLOW\Views\HomeView.swift`
- Modify: `G:\APPLICATIONS\FLOW\FLOW\Views\HistoryView.swift`
- Modify: `G:\APPLICATIONS\FLOW\FLOW\Views\AnalyticsView.swift`
- Modify: `G:\APPLICATIONS\FLOW\FLOW\Views\SettingsView.swift`

- [ ] **Step 1: Add tab integration and pending check-in presentation**

```swift
import SwiftUI

struct RootTabView: View {
    @Binding var pendingScheduledCheckIn: PendingScheduledCheckIn?

    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("Noter", systemImage: "square.and.pencil") }

            HistoryView()
                .tabItem { Label("Historique", systemImage: "clock") }

            AnalyticsView()
                .tabItem { Label("Analyse", systemImage: "chart.line.uptrend.xyaxis") }

            SettingsView()
                .tabItem { Label("Reglages", systemImage: "gearshape") }
        }
        .sheet(item: $pendingScheduledCheckIn) { payload in
            ScheduledCheckInView(
                notificationId: payload.notificationId,
                scheduledTime: payload.scheduledTime
            )
        }
    }
}
```

- [ ] **Step 2: Add clear empty states to key screens**

Example for history:

```swift
if filteredEntries.isEmpty {
    ContentUnavailableView(
        "Aucune entree",
        systemImage: "tray",
        description: Text("Commence par enregistrer un check-in ou une entree spontanee.")
    )
} else {
    List { ... }
}
```

Example for analytics:

```swift
if entries.isEmpty {
    ContentUnavailableView(
        "Pas encore de donnees",
        systemImage: "chart.bar.xaxis",
        description: Text("Les graphiques apparaitront apres quelques entrees.")
    )
}
```

- [ ] **Step 3: Build the whole app and run the full test suite**

Run:

```powershell
xcodebuild test -project FLOW.xcodeproj -scheme FLOW -destination "platform=iOS Simulator,name=iPhone 16"
```

Expected: `** TEST SUCCEEDED **`

- [ ] **Step 4: Perform a full manual MVP walkthrough**

Manual script:

```text
1. Launch the app on simulator.
2. Allow notifications.
3. Create one quick check-in.
4. Create one sleep entry, one migraine entry, and one meditation entry.
5. Open history, filter, edit an item, and delete one item.
6. Open analytics and verify charts and insight cards.
7. Open settings and adjust schedules.
```

Expected: the end-to-end flow works without any oversized form.

- [ ] **Step 5: Commit**

```bash
git add FLOW/Views
git commit -m "feat: polish FLOW MVP integration"
```

## Task 12: Document Launch, iPhone Install, And V2 Roadmap

**Files:**
- Modify: `G:\APPLICATIONS\FLOW\README.md`

- [ ] **Step 1: Add launch instructions**

```md
## Lancer l'app dans Xcode

1. Ouvrir `FLOW.xcodeproj` dans Xcode.
2. Selectionner le scheme `FLOW`.
3. Choisir un simulateur iPhone en `iOS 17+`.
4. Lancer avec `Cmd + R`.
```

- [ ] **Step 2: Add real-device install instructions**

```md
## Installer sur un iPhone reel

1. Connecter l'iPhone au Mac.
2. Ouvrir `FLOW.xcodeproj`.
3. Dans `Signing & Capabilities`, choisir un compte Apple personnel.
4. Selectionner l'iPhone comme destination.
5. Lancer avec `Cmd + R`.
6. Autoriser l'app dans les reglages de l'iPhone si necessaire.
```

- [ ] **Step 3: Add MVP scope and V2 roadmap**

```md
## MVP actuel

- Check-ins rapides energie/stress
- Entrees spontanees modulaires
- Historique avec modification et suppression
- Notifications locales
- Analyses ciblees
- Insights prudents

## Roadmap V2

- Export CSV
- Synchronisation iCloud
- Plus de croisements analytiques
- Widgets
- Personnalisation avancee de l'accueil
```

- [ ] **Step 4: Build once more after README-only changes**

Run:

```powershell
xcodebuild -project FLOW.xcodeproj -scheme FLOW -destination "generic/platform=iOS Simulator" build
```

Expected: `** BUILD SUCCEEDED **`

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: document FLOW setup and roadmap"
```

## Self-Review

Spec coverage check:

- Project Xcode ready to open: covered in Tasks 1 and 12.
- SwiftData models and enums: covered in Task 2.
- Modular spontaneous entries and short forms: covered in Tasks 4 and 5.
- Scheduled two-field check-ins and notifications: covered in Task 6.
- History, filters, edit, delete: covered in Task 7.
- Settings and schedule management: covered in Task 8.
- Focused analytics and cautious insights: covered in Tasks 9 and 10.
- Launch and iPhone installation docs plus V2 roadmap: covered in Task 12.

Placeholder scan:

- No `TODO` or `TBD` placeholders remain.
- Every task lists concrete files, commands, and example code blocks.

Type consistency check:

- `TrackingEntry`, `CheckInSchedule`, `EntryFormViewModel`, `NotificationManager`, `AnalyticsService`, and `InsightEngine` are referenced consistently across tasks.
- `RootTabView` is the single integration point for app tabs and scheduled-check-in presentation across later tasks.

Known execution note:

- The repository is not initialized with Git yet. The commit steps are included intentionally for execution time, but they will require `git init` or an existing repository before they can succeed.
