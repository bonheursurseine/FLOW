import XCTest
@testable import FLOW

final class TrackingEntryTests: XCTestCase {
    func testScheduledCheckInFactoryOnlyKeepsEnergyAndStress() {
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

    func testNormalizeClearsFieldsIrrelevantToMeditation() {
        let entry = TrackingEntry(
            timestamp: .now,
            entryType: .meditation,
            sourceType: .spontaneous,
            energyScore: 5,
            stressLevel: 9,
            meditationDuration: 15,
            comment: "Calme"
        )

        XCTAssertNil(entry.energyScore)
        XCTAssertNil(entry.stressLevel)
        XCTAssertEqual(entry.meditationDuration, 15)
        XCTAssertEqual(entry.comment, "Calme")
    }

    func testSummaryForCheckInIncludesEnergyAndStress() {
        let entry = TrackingEntry.makeScheduledCheckIn(
            timestamp: .now,
            energyScore: 6,
            stressLevel: 3
        )

        XCTAssertEqual(EntrySummaryBuilder.summary(for: entry), "Energie 6/10 - Stress 3/10")
    }
}
