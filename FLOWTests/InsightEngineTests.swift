import XCTest
@testable import FLOW

final class InsightEngineTests: XCTestCase {
    func testLowSleepInsightUsesCautiousLanguage() {
        let entries = [
            TrackingEntry(timestamp: .now, entryType: .sleep, sourceType: .spontaneous, sleepDuration: 5.0, sleepQuality: 4),
            TrackingEntry(timestamp: .now, entryType: .form, sourceType: .spontaneous, energyScore: 3),
            TrackingEntry(timestamp: Calendar.current.date(byAdding: .day, value: 1, to: .now)!, entryType: .sleep, sourceType: .spontaneous, sleepDuration: 8.0, sleepQuality: 8),
            TrackingEntry(timestamp: Calendar.current.date(byAdding: .day, value: 1, to: .now)!, entryType: .form, sourceType: .spontaneous, energyScore: 8),
        ]

        let insights = InsightEngine.generateInsights(entries: entries)

        XCTAssertTrue(insights.contains { $0.contains("semblent associes") || $0.contains("pourrait etre associee") || $0.contains("semble") })
    }
}
