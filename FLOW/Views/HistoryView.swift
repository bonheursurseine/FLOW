import SwiftUI
import SwiftData

struct HistoryView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \TrackingEntry.timestamp, order: .reverse) private var entries: [TrackingEntry]
    @State private var viewModel = HistoryViewModel()

    private var filteredEntries: [TrackingEntry] {
        entries.filter(viewModel.matches)
    }

    var body: some View {
        NavigationStack {
            Group {
                if filteredEntries.isEmpty {
                    ContentUnavailableView(
                        "Aucune entree",
                        systemImage: "tray",
                        description: Text("Commencez par enregistrer un check-in ou une entree spontanee.")
                    )
                } else {
                    List {
                        ForEach(filteredEntries) { entry in
                            NavigationLink {
                                EntryDetailView(entry: entry)
                            } label: {
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Label(
                                            EntryDisplayConfig.config(for: entry.entryType).title,
                                            systemImage: EntryDisplayConfig.config(for: entry.entryType).systemImage
                                        )
                                        .font(.headline)

                                        Spacer()

                                        Text(entry.sourceType.localizedTitle)
                                            .font(.caption.weight(.medium))
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 4)
                                            .background(Color(.secondarySystemBackground))
                                            .clipShape(Capsule())
                                    }

                                    Text(EntrySummaryBuilder.summary(for: entry))
                                        .foregroundStyle(.secondary)

                                    Text(entry.timestamp.formatted(date: .abbreviated, time: .shortened))
                                        .font(.caption)
                                        .foregroundStyle(.tertiary)
                                }
                                .padding(.vertical, 4)
                            }
                        }
                        .onDelete(perform: deleteEntries)
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Historique")
            .safeAreaInset(edge: .top) {
                VStack(spacing: 12) {
                    FilterChipRow(
                        title: "Type",
                        options: EntryType.allCases,
                        optionTitle: { EntryDisplayConfig.config(for: $0).title },
                        selection: $viewModel.selectedEntryType
                    )

                    FilterChipRow(
                        title: "Source",
                        options: SourceType.allCases,
                        optionTitle: { $0.localizedTitle },
                        selection: $viewModel.selectedSourceType
                    )
                }
                .padding(.vertical, 10)
                .background(.bar)
            }
        }
    }

    private func deleteEntries(at offsets: IndexSet) {
        offsets.map { filteredEntries[$0] }.forEach(modelContext.delete)
        try? modelContext.save()
    }
}
