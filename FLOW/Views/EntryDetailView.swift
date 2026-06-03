import SwiftUI
import SwiftData

struct EntryDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var isEditing = false

    let entry: TrackingEntry

    var body: some View {
        List {
            Section("Resume") {
                detailRow("Type", EntryDisplayConfig.config(for: entry.entryType).title)
                detailRow("Source", entry.sourceType.localizedTitle)
                detailRow("Date", entry.timestamp.formatted(date: .complete, time: .shortened))
                detailRow("Apercu", EntrySummaryBuilder.summary(for: entry))
            }

            Section("Details") {
                if let energyScore = entry.energyScore {
                    detailRow("Energie", "\(energyScore)/10")
                }
                if let stressLevel = entry.stressLevel {
                    detailRow("Stress", "\(stressLevel)/10")
                }
                if let sleepDuration = entry.sleepDuration {
                    detailRow("Sommeil", "\(sleepDuration, specifier: "%.1f") h")
                }
                if let sleepQuality = entry.sleepQuality {
                    detailRow("Qualite du sommeil", "\(sleepQuality)/10")
                }
                if let mentalLoad = entry.mentalLoad {
                    detailRow("Charge mentale", "\(mentalLoad)/10")
                }
                if let migraineLevel = entry.migraineLevel?.localizedTitle {
                    detailRow("Migraine", migraineLevel)
                }
                if let migrainePainScore = entry.migrainePainScore {
                    detailRow("Douleur", "\(migrainePainScore)/10")
                }
                if let migraineMedicationNote = entry.migraineMedicationNote {
                    detailRow("Medicament migraine", migraineMedicationNote)
                }
                if let caffeineLevel = entry.caffeineLevel?.localizedTitle {
                    detailRow("Cafeine", caffeineLevel)
                }
                if let physicalActivityLevel = entry.physicalActivityLevel?.localizedTitle {
                    detailRow("Activite physique", physicalActivityLevel)
                }
                if let mealType = entry.mealType?.localizedTitle {
                    detailRow("Repas", mealType)
                }
                if let napDuration = entry.napDuration {
                    detailRow("Sieste", "\(napDuration) min")
                }
                if let screenTimeLevel = entry.screenTimeLevel?.localizedTitle {
                    detailRow("Temps d'ecran", screenTimeLevel)
                }
                if let medicationNote = entry.medicationNote {
                    detailRow("Medicament", medicationNote)
                }
                if let meditationDuration = entry.meditationDuration {
                    detailRow("Meditation", "\(meditationDuration) min")
                }
                if let eventNote = entry.eventNote {
                    detailRow("Evenement", eventNote)
                }
                if let freeNote = entry.freeNote {
                    detailRow("Note libre", freeNote)
                }
                if let comment = entry.comment {
                    detailRow("Commentaire", comment)
                }
            }

            Section {
                Button(role: .destructive) {
                    modelContext.delete(entry)
                    try? modelContext.save()
                    dismiss()
                } label: {
                    Text("Supprimer")
                }
            }
        }
        .navigationTitle("Detail")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Modifier") {
                    isEditing = true
                }
            }
        }
        .sheet(isPresented: $isEditing) {
            EntryFormView(
                entryType: entry.entryType,
                sourceType: entry.sourceType,
                existingEntry: entry
            )
        }
    }

    @ViewBuilder
    private func detailRow(_ title: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value)
        }
        .padding(.vertical, 2)
    }
}
