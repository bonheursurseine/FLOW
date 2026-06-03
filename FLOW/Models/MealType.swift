import Foundation

enum MealType: String, Codable, CaseIterable, Identifiable, Sendable {
    case normal
    case light
    case heavy
    case skipped

    var id: String { rawValue }

    var title: String {
        switch self {
        case .normal:
            return "Normal"
        case .light:
            return "Leger"
        case .heavy:
            return "Copieux"
        case .skipped:
            return "Saute"
        }
    }

    var localizedTitle: String { title }
}
