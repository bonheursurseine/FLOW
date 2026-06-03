import Foundation
import Observation

@Observable
final class SettingsViewModel {
    var notificationsEnabled: Bool
    var visibleEntryTypes: [EntryType]

    init(
        notificationsEnabled: Bool = false,
        visibleEntryTypes: [EntryType] = HomeViewModel.defaultVisibleEntryTypes
    ) {
        self.notificationsEnabled = notificationsEnabled
        self.visibleEntryTypes = visibleEntryTypes
    }

    static func makeDefaultSchedules(referenceDate: Date = .now) -> [CheckInSchedule] {
        let calendar = Calendar.current
        let labels = ["Matin", "Midi", "Apres-midi", "Soir"]
        let hours = [8, 12, 16, 20]

        return zip(hours, labels).compactMap { hour, label in
            guard let time = calendar.date(bySettingHour: hour, minute: 0, second: 0, of: referenceDate) else {
                return nil
            }
            return CheckInSchedule(time: time, isEnabled: true, label: label)
        }
    }

    func addSchedule(time: Date, label: String? = nil, to schedules: inout [CheckInSchedule]) {
        schedules.append(CheckInSchedule(time: time, isEnabled: true, label: label))
        schedules = sortedSchedules(schedules)
    }

    func updateSchedule(_ schedule: CheckInSchedule, time: Date, isEnabled: Bool, label: String? = nil) {
        schedule.time = time
        schedule.isEnabled = isEnabled
        schedule.label = label?.trimmingCharacters(in: .whitespacesAndNewlines).nilIfEmpty
    }

    func deleteSchedule(_ schedule: CheckInSchedule, from schedules: inout [CheckInSchedule]) {
        schedules.removeAll { $0.id == schedule.id }
    }

    func toggleVisibility(for entryType: EntryType) {
        if visibleEntryTypes.contains(entryType) {
            visibleEntryTypes.removeAll { $0 == entryType }
        } else {
            visibleEntryTypes.append(entryType)
        }
        visibleEntryTypes.sort { $0.rawValue < $1.rawValue }
    }

    func sortedSchedules(_ schedules: [CheckInSchedule]) -> [CheckInSchedule] {
        schedules.sorted {
            let lhs = $0.timeComponents
            let rhs = $1.timeComponents
            if lhs.hour == rhs.hour {
                return (lhs.minute ?? 0) < (rhs.minute ?? 0)
            }
            return (lhs.hour ?? 0) < (rhs.hour ?? 0)
        }
    }
}

private extension String {
    var nilIfEmpty: String? {
        isEmpty ? nil : self
    }
}
