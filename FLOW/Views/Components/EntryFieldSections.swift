import SwiftUI

struct EntryFieldSections: View {
    @Bindable var viewModel: EntryFormViewModel

    var body: some View {
        switch viewModel.entryType {
        case .form:
            scoreSection(title: "Forme", value: $viewModel.energyScore)
            commentSection
        case .sleep:
            sleepSection
        case .stress:
            scoreSection(title: "Stress", value: $viewModel.stressLevel)
            commentSection
        case .mentalLoad:
            scoreSection(title: "Charge mentale", value: $viewModel.mentalLoad)
            commentSection
        case .migraine:
            migraineSection
        case .caffeine:
            caffeineSection
        case .physicalActivity:
            physicalActivitySection
        case .meal:
            mealSection
        case .nap:
            napSection
        case .screenTime:
            screenTimeSection
        case .medication:
            medicationSection
        case .meditation:
            meditationSection
        case .notableEvent:
            notableEventSection
        case .freeNote:
            freeNoteSection
        case .checkIn:
            checkInSection
        }
    }

    private func scoreSection(title: String, value: Binding<Int?>) -> some View {
        Section(title) {
            Picker("Valeur", selection: value) {
                Text("Choisir").tag(Optional<Int>.none)
                ForEach(1...10, id: \.self) { score in
                    Text("\(score)/10").tag(Optional(score))
                }
            }
        }
    }

    private var commentSection: some View {
        Section("Commentaire") {
            TextField("Optionnel", text: $viewModel.comment, axis: .vertical)
                .lineLimit(3, reservesSpace: true)
        }
    }

    private var sleepSection: some View {
        Group {
            Section("Sommeil") {
                Picker("Duree", selection: $viewModel.sleepDuration) {
                    Text("Choisir").tag(Optional<Double>.none)
                    ForEach(Array(stride(from: 0.5, through: 12.0, by: 0.5)), id: \.self) { duration in
                        Text("\(duration, specifier: "%.1f") h").tag(Optional(duration))
                    }
                }

                Picker("Qualite", selection: $viewModel.sleepQuality) {
                    Text("Choisir").tag(Optional<Int>.none)
                    ForEach(1...10, id: \.self) { quality in
                        Text("\(quality)/10").tag(Optional(quality))
                    }
                }
            }

            commentSection
        }
    }

    private var migraineSection: some View {
        Group {
            Section("Migraine") {
                Picker("Niveau", selection: $viewModel.migraineLevel) {
                    Text("Choisir").tag(Optional<MigraineLevel>.none)
                    ForEach(MigraineLevel.allCases) { level in
                        Text(level.localizedTitle).tag(Optional(level))
                    }
                }

                Picker("Douleur", selection: $viewModel.migrainePainScore) {
                    Text("Choisir").tag(Optional<Int>.none)
                    ForEach(1...10, id: \.self) { pain in
                        Text("\(pain)/10").tag(Optional(pain))
                    }
                }

                Toggle("Medicament pris", isOn: Binding(
                    get: { viewModel.migraineMedicationTaken ?? false },
                    set: { viewModel.migraineMedicationTaken = $0 }
                ))

                if viewModel.migraineMedicationTaken ?? false {
                    TextField("Nom ou note", text: $viewModel.migraineMedicationNote)
                }
            }

            commentSection
        }
    }

    private var caffeineSection: some View {
        Group {
            Section("Cafeine") {
                Picker("Niveau", selection: $viewModel.caffeineLevel) {
                    Text("Choisir").tag(Optional<CaffeineLevel>.none)
                    ForEach(CaffeineLevel.allCases) { level in
                        Text(level.localizedTitle).tag(Optional(level))
                    }
                }
            }

            commentSection
        }
    }

    private var physicalActivitySection: some View {
        Group {
            Section("Activite physique") {
                Picker("Niveau", selection: $viewModel.physicalActivityLevel) {
                    Text("Choisir").tag(Optional<PhysicalActivityLevel>.none)
                    ForEach(PhysicalActivityLevel.allCases) { level in
                        Text(level.localizedTitle).tag(Optional(level))
                    }
                }
            }

            commentSection
        }
    }

    private var mealSection: some View {
        Group {
            Section("Repas") {
                Picker("Type", selection: $viewModel.mealType) {
                    Text("Choisir").tag(Optional<MealType>.none)
                    ForEach(MealType.allCases) { mealType in
                        Text(mealType.localizedTitle).tag(Optional(mealType))
                    }
                }
            }

            commentSection
        }
    }

    private var napSection: some View {
        Group {
            Section("Sieste") {
                Picker("Duree", selection: $viewModel.napDuration) {
                    Text("Choisir").tag(Optional<Int>.none)
                    ForEach(Array(stride(from: 5, through: 180, by: 5)), id: \.self) { duration in
                        Text("\(duration) min").tag(Optional(duration))
                    }
                }
            }

            commentSection
        }
    }

    private var screenTimeSection: some View {
        Group {
            Section("Temps d'ecran") {
                Picker("Niveau", selection: $viewModel.screenTimeLevel) {
                    Text("Choisir").tag(Optional<ScreenTimeLevel>.none)
                    ForEach(ScreenTimeLevel.allCases) { level in
                        Text(level.localizedTitle).tag(Optional(level))
                    }
                }
            }

            commentSection
        }
    }

    private var medicationSection: some View {
        Group {
            Section("Medicament") {
                TextField("Nom ou description", text: $viewModel.medicationNote)
            }

            commentSection
        }
    }

    private var meditationSection: some View {
        Group {
            Section("Meditation") {
                Picker("Duree", selection: $viewModel.meditationDuration) {
                    Text("Choisir").tag(Optional<Int>.none)
                    ForEach(Array(stride(from: 5, through: 180, by: 5)), id: \.self) { duration in
                        Text("\(duration) min").tag(Optional(duration))
                    }
                }
            }

            commentSection
        }
    }

    private var notableEventSection: some View {
        Group {
            Section("Evenement particulier") {
                TextField("Description", text: $viewModel.eventNote, axis: .vertical)
                    .lineLimit(4, reservesSpace: true)
            }

            commentSection
        }
    }

    private var freeNoteSection: some View {
        Section("Note libre") {
            TextField("Texte", text: $viewModel.freeNote, axis: .vertical)
                .lineLimit(6, reservesSpace: true)
        }
    }

    private var checkInSection: some View {
        Group {
            scoreSection(title: "Energie", value: $viewModel.energyScore)
            scoreSection(title: "Stress", value: $viewModel.stressLevel)
        }
    }
}
