import SwiftUI

struct RootTabView: View {
    @EnvironmentObject private var notificationManager: NotificationManager

    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("Noter", systemImage: "square.and.pencil")
                }

            HistoryView()
                .tabItem {
                    Label("Historique", systemImage: "clock.arrow.circlepath")
                }

            AnalyticsView()
                .tabItem {
                    Label("Analyse", systemImage: "chart.xyaxis.line")
                }

            SettingsView()
                .tabItem {
                    Label("Reglages", systemImage: "gearshape")
                }
        }
        .sheet(item: $notificationManager.pendingCheckIn) { payload in
            ScheduledCheckInView(
                notificationId: payload.notificationId,
                scheduledTime: payload.scheduledTime
            )
        }
    }
}
