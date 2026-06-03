import Foundation

struct EntryDisplayConfig: Sendable, Equatable {
    let title: String
    let shortTitle: String
    let systemImage: String

    static func config(for type: EntryType) -> EntryDisplayConfig {
        switch type {
        case .form:
            return .init(title: "Forme", shortTitle: "Forme", systemImage: "sun.max")
        case .sleep:
            return .init(title: "Sommeil", shortTitle: "Sommeil", systemImage: "bed.double")
        case .stress:
            return .init(title: "Stress", shortTitle: "Stress", systemImage: "bolt.heart")
        case .mentalLoad:
            return .init(title: "Charge mentale", shortTitle: "Charge", systemImage: "brain.head.profile")
        case .migraine:
            return .init(title: "Migraine", shortTitle: "Migraine", systemImage: "head.side")
        case .caffeine:
            return .init(title: "Cafeine", shortTitle: "Cafeine", systemImage: "cup.and.saucer")
        case .physicalActivity:
            return .init(title: "Activite physique", shortTitle: "Activite", systemImage: "figure.walk")
        case .meal:
            return .init(title: "Repas", shortTitle: "Repas", systemImage: "fork.knife")
        case .nap:
            return .init(title: "Sieste", shortTitle: "Sieste", systemImage: "moon.zzz")
        case .screenTime:
            return .init(title: "Temps d'ecran", shortTitle: "Ecran", systemImage: "iphone")
        case .medication:
            return .init(title: "Medicament", shortTitle: "Medicament", systemImage: "pills")
        case .meditation:
            return .init(title: "Meditation", shortTitle: "Meditation", systemImage: "sparkles")
        case .notableEvent:
            return .init(title: "Evenement particulier", shortTitle: "Evenement", systemImage: "star.bubble")
        case .freeNote:
            return .init(title: "Note libre", shortTitle: "Note", systemImage: "note.text")
        case .checkIn:
            return .init(title: "Check-in", shortTitle: "Check-in", systemImage: "waveform.path.ecg")
        }
    }
}
