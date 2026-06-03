import SwiftUI
import SwiftData

struct HomeView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = HomeViewModel()
    @AppStorage("visibleEntryTypes") private var visibleEntryTypeStorage = ""

    private var visibleEntryTypes: [EntryType] {
        let stored = visibleEntryTypeStorage
            .split(separator: ",")
            .compactMap { EntryType(rawValue: String($0)) }
        return stored.isEmpty ? viewModel.availableEntryTypes : viewModel.availableEntryTypes.filter { stored.contains($0) }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    QuickCheckInCard(
                        energy: $viewModel.quickCheckInEnergy,
                        stress: $viewModel.quickCheckInStress
                    ) {
                        let entry = viewModel.makeQuickCheckInEntry()
                        modelContext.insert(entry)
                        try? modelContext.save()
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Entrees spontanees")
                            .font(.title3.weight(.semibold))

                        EntryTypeCardGrid(entryTypes: visibleEntryTypes) { entryType in
                            viewModel.selectedEntryType = entryType
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("FLOW")
            .sheet(item: $viewModel.selectedEntryType) { entryType in
                EntryFormView(entryType: entryType, sourceType: .spontaneous)
            }
        }
    }
}
