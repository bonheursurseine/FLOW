import Foundation

enum PhysicalActivityLevel: String, Codable, CaseIterable, Identifiable, Sendable {
    case none
    case light
    case moderate
    case intense

    var id: String { rawValue }

    var title: String {
        switch self {
        case .none:
            return "Aucune"
        case .light:
            return "Legere"
        case .moderate:
            return "Moderee"
        case .intense:
            return "Intense"
        }
    }

    var localizedTitle: String { title }
}
