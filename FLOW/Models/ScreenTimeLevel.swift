import Foundation

enum ScreenTimeLevel: String, Codable, CaseIterable, Identifiable, Sendable {
    case low
    case medium
    case high
    case veryHigh

    var id: String { rawValue }

    var title: String {
        switch self {
        case .low:
            return "Faible"
        case .medium:
            return "Modere"
        case .high:
            return "Eleve"
        case .veryHigh:
            return "Tres eleve"
        }
    }

    var localizedTitle: String { title }
}
