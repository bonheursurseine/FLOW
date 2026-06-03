import SwiftUI
import SwiftData

@main
struct FLOWApp: App {
    @StateObject private var notificationManager = NotificationManager.shared

    private let sharedModelContainer: ModelContainer = {
        let schema = Schema([
            TrackingEntry.self,
            CheckInSchedule.self,
        ])

        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            let container = try ModelContainer(for: schema, configurations: [configuration])
            let context = container.mainContext
            let descriptor = FetchDescriptor<CheckInSchedule>()

            if let count = try? context.fetchCount(descriptor), count == 0 {
                SettingsViewModel.makeDefaultSchedules().forEach { context.insert($0) }
                try? context.save()
            }

            return container
        } catch {
            fatalError("Unable to create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .environmentObject(notificationManager)
                .task {
                    await notificationManager.refreshAuthorizationStatus()
                }
        }
        .modelContainer(sharedModelContainer)
    }
}
