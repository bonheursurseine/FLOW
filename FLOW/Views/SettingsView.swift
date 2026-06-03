import SwiftUI
import SwiftData
import UserNotifications

struct SettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject private var notificationManager: NotificationManager
    @Query(sort: \CheckInSchedule.time) private var schedules: [CheckInSchedule]

    @AppStorage("visibleEntryTypes") private var visibleEntryTypeStorage = ""

    var body: some View {
        NavigationStack {
            List {
                Section("Confidentialite") {
                    Text("Toutes les donnees restent stockees localement sur cet iPhone.")
                        .font(.subheadline)
                }

                Section("Notifications") {
                    HStack {
                        Text("Statut")
                        Spacer()
                        Text(notificationManager.authorizationStatus.localizedTitle)
                            .foregroundStyle(.secondary)
                    }

                    Button("Autoriser les notifications") {
                        Task {
                            try? await notificationManager.requestAuthorization()
                            await notificationManager.scheduleNotifications(for: schedules)
                        }
                    }

                    ForEach(schedules) { schedule in
                        @Bindable var schedule = schedule

                        HStack {
                            DatePicker(
                                "",
                                selection: $schedule.time,
                                displayedComponents: .hourAndMinute
                            )
                            .labelsHidden()

                            Spacer()

                            Toggle("", isOn: $schedule.isEnabled)
                                .labelsHidden()
                        }
                    }
                    .onDelete(perform: deleteSchedules)

                    Button("Ajouter un horaire") {
                        let date = Calendar.current.date(bySettingHour: 9, minute: 0, second: 0, of: .now) ?? .now
                        modelContext.insert(CheckInSchedule(time: date, isEnabled: true))
                        try? modelContext.save()
                    }
                }

                Section("Cartes visibles sur l'accueil") {
                    ForEach(HomeViewModel().availableEntryTypes) { entryType in
                        Toggle(
                            EntryDisplayConfig.config(for: entryType).title,
                            isOn: Binding(
                                get: { selectedEntryTypes.contains(entryType) },
                                set: { isEnabled in
                                    updateVisibleEntryType(entryType, isEnabled: isEnabled)
                                }
                            )
                        )
                    }
                }

                Section("Bientot disponible") {
                    Text("Export CSV")
                    Text("Synchronisation iCloud")
                }
            }
            .navigationTitle("Reglages")
            .task(id: scheduleSignature) {
                await notificationManager.scheduleNotifications(for: schedules)
            }
        }
    }

    private var selectedEntryTypes: Set<EntryType> {
        let entries = visibleEntryTypeStorage.split(separator: ",").compactMap { EntryType(rawValue: String($0)) }
        if entries.isEmpty {
            return Set(HomeViewModel().availableEntryTypes)
        }
        return Set(entries)
    }

    private func updateVisibleEntryType(_ entryType: EntryType, isEnabled: Bool) {
        var updated = selectedEntryTypes

        if isEnabled {
            updated.insert(entryType)
        } else if updated.count > 1 {
            updated.remove(entryType)
        }

        visibleEntryTypeStorage = updated.map(\.rawValue).sorted().joined(separator: ",")
    }

    private func deleteSchedules(at offsets: IndexSet) {
        offsets.map { schedules[$0] }.forEach(modelContext.delete)
        try? modelContext.save()
    }

    private var scheduleSignature: String {
        schedules
            .map { "\($0.notificationIdentifier)-\($0.time.timeIntervalSince1970)-\($0.isEnabled)" }
            .joined(separator: "|")
    }
}

private extension UNAuthorizationStatus {
    var localizedTitle: String {
        switch self {
        case .notDetermined:
            return "Non demande"
        case .denied:
            return "Refuse"
        case .authorized:
            return "Autorise"
        case .provisional:
            return "Provisoire"
        case .ephemeral:
            return "Ephemere"
        @unknown default:
            return "Inconnu"
        }
    }
}
