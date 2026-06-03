import Foundation

enum SourceType: String, Codable, CaseIterable, Identifiable, Sendable {
    case spontaneous
    case scheduledCheckIn

    var id: String { rawValue }

    var localizedTitle: String {
        switch self {
        case .spontaneous:
            return "Spontane"
        case .scheduledCheckIn:
            return "Check-in"
        }
    }
}
