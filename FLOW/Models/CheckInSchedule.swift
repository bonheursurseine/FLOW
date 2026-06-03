import Foundation
import SwiftData

@Model
final class CheckInSchedule {
    var id: UUID
    var time: Date
    var isEnabled: Bool
    var label: String?

    init(
        id: UUID = UUID(),
        time: Date,
        isEnabled: Bool = true,
        label: String? = nil
    ) {
        self.id = id
        self.time = time
        self.isEnabled = isEnabled
        self.label = label?.trimmingCharacters(in: .whitespacesAndNewlines).nilIfEmpty
    }
}

extension CheckInSchedule {
    var notificationIdentifier: String {
        "checkin-\(id.uuidString)"
    }

    var displayLabel: String {
        if let label, label.isEmpty == false {
            return label
        }
        return time.formatted(date: .omitted, time: .shortened)
    }

    var timeComponents: DateComponents {
        Calendar.current.dateComponents([.hour, .minute], from: time)
    }
}

private extension String {
    var nilIfEmpty: String? {
        isEmpty ? nil : self
    }
}
