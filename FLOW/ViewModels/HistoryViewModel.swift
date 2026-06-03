import Foundation
import Observation

@Observable
final class HistoryViewModel {
    var selectedEntryType: EntryType?
    var selectedSourceType: SourceType?
    var searchText: String = ""

    init(selectedEntryType: EntryType? = nil, selectedSourceType: SourceType? = nil, searchText: String = "") {
        self.selectedEntryType = selectedEntryType
        self.selectedSourceType = selectedSourceType
        self.searchText = searchText
    }

    func matches(_ entry: TrackingEntry) -> Bool {
        filteredEntries(from: [entry]).isEmpty == false
    }

    func filteredEntries(from entries: [TrackingEntry]) -> [TrackingEntry] {
        entries
            .filter { entry in
                if let selectedEntryType, entry.entryType != selectedEntryType {
                    return false
                }
                if let selectedSourceType, entry.sourceType != selectedSourceType {
                    return false
                }
                if normalizedSearchText.isEmpty {
                    return true
                }
                let haystack = (
                    [entry.displayTitle, EntrySummaryBuilder.summary(for: entry)] +
                    [entry.comment, entry.freeNote, entry.eventNote, entry.medicationNote].compactMap { $0 }
                )
                .map { $0.folding(options: [.diacriticInsensitive, .caseInsensitive], locale: .current) }
                .joined(separator: " ")
                return haystack.contains(normalizedSearchText)
            }
            .sorted { $0.timestamp > $1.timestamp }
    }

    func groupedEntriesByDay(from entries: [TrackingEntry]) -> [(day: Date, entries: [TrackingEntry])] {
        let filtered = filteredEntries(from: entries)
        let grouped = Dictionary(grouping: filtered) { DateBucket.startOfDay(for: $0.timestamp) }
        return grouped
            .map { day, entries in (day: day, entries: entries.sorted { $0.timestamp > $1.timestamp }) }
            .sorted { $0.day > $1.day }
    }

    func deleteEntries(at offsets: IndexSet, from entries: [TrackingEntry]) -> [TrackingEntry] {
        var updatedEntries = filteredEntries(from: entries)
        for index in offsets.sorted(by: >) where updatedEntries.indices.contains(index) {
            updatedEntries.remove(at: index)
        }
        return updatedEntries
    }

    private var normalizedSearchText: String {
        searchText
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .folding(options: [.diacriticInsensitive, .caseInsensitive], locale: .current)
    }
}
