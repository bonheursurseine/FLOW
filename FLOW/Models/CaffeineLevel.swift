import Foundation

enum CaffeineLevel: String, Codable, CaseIterable, Identifiable, Sendable {
    case none
    case low
    case medium
    case high

    var id: String { rawValue }

    var title: String {
        switch self {
        case .none:
            return "Aucune"
        case .low:
            return "Faible"
        case .medium:
            return "Moderee"
        case .high:
            return "Elevee"
        }
    }

    var localizedTitle: String { title }
}
