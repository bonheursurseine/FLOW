import Foundation

enum EntryType: String, Codable, CaseIterable, Identifiable, Sendable {
    case form
    case sleep
    case stress
    case mentalLoad
    case migraine
    case caffeine
    case physicalActivity
    case meal
    case nap
    case screenTime
    case medication
    case meditation
    case notableEvent
    case freeNote
    case checkIn

    var id: String { rawValue }

    var requiresEnergyScore: Bool {
        self == .form || self == .checkIn
    }

    var requiresStressLevel: Bool {
        self == .stress || self == .checkIn
    }

    var usesCommentField: Bool {
        switch self {
        case .form, .sleep, .stress, .mentalLoad, .migraine, .caffeine, .physicalActivity, .meal, .nap, .screenTime, .meditation, .checkIn:
            return true
        case .medication, .notableEvent, .freeNote:
            return false
        }
    }
}
