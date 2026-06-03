import XCTest
import UserNotifications
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
