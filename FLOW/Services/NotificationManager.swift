import Foundation
import UserNotifications

struct PendingScheduledCheckIn: Identifiable, Equatable {
    let id = UUID()
    let notificationId: String?
    let scheduledTime: Date?
}

@MainActor
final class NotificationManager: NSObject, ObservableObject {
    static let shared = NotificationManager()

    @Published private(set) var authorizationStatus: UNAuthorizationStatus = .notDetermined
    @Published var pendingCheckIn: PendingScheduledCheckIn?

    private override init() {
        super.init()
        UNUserNotificationCenter.current().delegate = self
    }

    func refreshAuthorizationStatus() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        authorizationStatus = settings.authorizationStatus
    }

    func requestAuthorization() async throws {
        let granted = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])
        if granted {
            UNUserNotificationCenter.current().delegate = self
        }
        await refreshAuthorizationStatus()
    }

    func scheduleNotifications(for schedules: [CheckInSchedule]) async {
        let center = UNUserNotificationCenter.current()
        center.removeAllPendingNotificationRequests()

        for request in Self.makeRequests(for: schedules) {
            try? await center.add(request)
        }
    }

    static func makeRequests(for schedules: [CheckInSchedule]) -> [UNNotificationRequest] {
        let bodyOptions = [
            "Comment est ton energie maintenant ?",
            "Prends 10 secondes pour ton check-in.",
            "Energie et stress : ou en es-tu ?",
        ]

        return schedules
            .filter(\.isEnabled)
            .enumerated()
            .map { index, schedule in
                let content = UNMutableNotificationContent()
                content.title = "FLOW"
                content.body = bodyOptions[index % bodyOptions.count]
                content.sound = .default
                content.userInfo = [
                    "kind": "scheduledCheckIn",
                    "notificationId": schedule.notificationIdentifier,
                ]

                let trigger = UNCalendarNotificationTrigger(
                    dateMatching: schedule.timeComponents,
                    repeats: true
                )

                return UNNotificationRequest(
                    identifier: schedule.notificationIdentifier,
                    content: content,
                    trigger: trigger
                )
            }
    }

    private func openPendingCheckIn(from response: UNNotificationResponse?) {
        let notificationId = response?.notification.request.identifier
        pendingCheckIn = PendingScheduledCheckIn(
            notificationId: notificationId,
            scheduledTime: Date()
        )
    }
}

extension NotificationManager: UNUserNotificationCenterDelegate {
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound])
    }

    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        Task { @MainActor in
            self.openPendingCheckIn(from: response)
            completionHandler()
        }
    }
}
