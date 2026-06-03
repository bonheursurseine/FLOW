import XCTest
@testable import FLOW

final class AnalyticsServiceTests: XCTestCase {
    func testAverageEnergyByHourUsesScheduledCheckInsOnly() {
        let checkInA = TrackingEntry.makeScheduledCheckIn(timestamp: date(hour: 8), energyScore: 6, stressLevel: 4)
        let checkInB = TrackingEntry.makeScheduledCheckIn(timestamp: date(hour: 8), energyScore: 8, stressLevel: 3)
        let formEntry = TrackingEntry(timestamp: date(hour: 8), entryType: .form, sourceType: .spontaneous, energyScore: 2)

        let result = AnalyticsService.averageEnergyByHour(entries: [checkInA, checkInB, formEntry])

        XCTAssertEqual(result.count, 1)
        XCTAssertEqual(result[0].hour, 8)
        XCTAssertEqual(result[0].average, 7.0)
    }

    private func date(hour: Int) -> Date {
        Calendar.current.date(bySettingHour: hour, minute: 0, second: 0, of: .now)!
    }
}
