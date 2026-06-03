import XCTest
@testable import FLOW

final class EntryFormViewModelTests: XCTestCase {
    func testScheduledCheckInRequiresEnergyAndStress() {
        let viewModel = EntryFormViewModel(entryType: .checkIn, sourceType: .scheduledCheckIn)

        XCTAssertNil(viewModel.energyScore)
        XCTAssertNil(viewModel.stressLevel)
        XCTAssertFalse(viewModel.canSave)

        viewModel.energyScore = 8
        viewModel.stressLevel = 2

        XCTAssertTrue(viewModel.canSave)
    }

    func testMigraineRequiresMeaningfulData() {
        let viewModel = EntryFormViewModel(entryType: .migraine, sourceType: .spontaneous)

        XCTAssertNil(viewModel.migraineLevel)
        XCTAssertNil(viewModel.migrainePainScore)
        XCTAssertFalse(viewModel.canSave)

        viewModel.migrainePainScore = 6

        XCTAssertTrue(viewModel.canSave)
    }

    func testBuildEntryUpdatesExistingObject() {
        let existing = TrackingEntry(timestamp: .now, entryType: .form, sourceType: .spontaneous, energyScore: 3)
        let viewModel = EntryFormViewModel(entryType: .form, sourceType: .spontaneous)

        viewModel.energyScore = 8
        let updated = viewModel.buildEntry(existing: existing)

        XCTAssertTrue(existing === updated)
        XCTAssertEqual(updated.energyScore, 8)
    }

    func testDefaultSchedulesCreateFourTimes() {
        let schedules = SettingsViewModel.makeDefaultSchedules(referenceDate: Date(timeIntervalSince1970: 0))

        XCTAssertEqual(schedules.count, 4)
    }

    func testQuickCheckInSaveCreatesScheduledCheckInEntry() {
        let viewModel = HomeViewModel()

        viewModel.quickCheckInEnergy = 7
        viewModel.quickCheckInStress = 5

        let entry = viewModel.makeQuickCheckInEntry()

        XCTAssertEqual(entry.entryType, .checkIn)
        XCTAssertEqual(entry.sourceType, .spontaneous)
        XCTAssertEqual(entry.energyScore, 7)
        XCTAssertEqual(entry.stressLevel, 5)
    }
}
