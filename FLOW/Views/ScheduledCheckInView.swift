import SwiftUI
import SwiftData

struct ScheduledCheckInView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext

    @State private var energyScore = 5
    @State private var stressLevel = 5

    let notificationId: String?
    let scheduledTime: Date?

    var body: some View {
        NavigationStack {
            Form {
                Section("Check-in") {
                    Slider(value: Binding(
                        get: { Double(energyScore) },
                        set: { energyScore = Int($0.rounded()) }
                    ), in: 1...10, step: 1)
                    .tint(.orange)

                    HStack {
                        Text("Energie")
                        Spacer()
                        Text("\(energyScore)/10")
                            .foregroundStyle(.secondary)
                    }

                    Slider(value: Binding(
                        get: { Double(stressLevel) },
                        set: { stressLevel = Int($0.rounded()) }
                    ), in: 1...10, step: 1)
                    .tint(.pink)

                    HStack {
                        Text("Stress")
                        Spacer()
                        Text("\(stressLevel)/10")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Check-in")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
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
