import Foundation

enum MigraineLevel: String, Codable, CaseIterable, Identifiable, Sendable {
    case none
    case mild
    case moderate
    case severe

    var id: String { rawValue }

    var title: String {
        switch self {
        case .none:
            return "Aucune"
        case .mild:
            return "Legere"
        case .moderate:
            return "Moderee"
        case .severe:
            return "Forte"
        }
    }

    var localizedTitle: String { title }
}
