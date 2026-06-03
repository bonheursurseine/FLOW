import SwiftUI
import SwiftData

struct EntryFormView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel: EntryFormViewModel

    private let existingEntry: TrackingEntry?

    init(entryType: EntryType, sourceType: SourceType, existingEntry: TrackingEntry? = nil) {
        let viewModel = EntryFormViewModel(entryType: entryType, sourceType: sourceType)

        if let existingEntry {
            viewModel.load(from: existingEntry)
        }

        _viewModel = State(initialValue: viewModel)
        self.existingEntry = existingEntry
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Quand") {
                    DatePicker("Date et heure", selection: $viewModel.timestamp)
                }

                EntryFieldSections(viewModel: viewModel)
            }
            .navigationTitle(EntryDisplayConfig.config(for: viewModel.entryType).title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Enregistrer") {
                        let entry = viewModel.buildEntry(existing: existingEntry)
                        if existingEntry == nil {
                            modelContext.insert(entry)
                        }
                        try? modelContext.save()
                        dismiss()
                    }
                    .disabled(!viewModel.canSave)
                }
            }
        }
    }
}
