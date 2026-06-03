import Foundation

enum EntrySummaryBuilder {
    static func summary(for entry: TrackingEntry) -> String {
        switch entry.entryType {
        case .checkIn:
            let energy = entry.energyScore.map { "Energie \($0)/10" } ?? "Energie -"
            let stress = entry.stressLevel.map { "Stress \($0)/10" } ?? "Stress -"
            return "\(energy) - \(stress)"
        case .form:
            let score = entry.energyScore.map { "\($0)/10" } ?? "-"
            return "Forme \(score)"
        case .sleep:
            var parts: [String] = []
            if let duration = entry.sleepDuration {
                parts.append("Sommeil \(formattedHours(duration))")
            }
            if let quality = entry.sleepQuality {
                parts.append("Qualite \(quality)/10")
            }
            if let comment = entry.comment {
                parts.append(comment)
            }
            return fallback(parts, title: "Sommeil")
        case .stress:
            return scoredSummary(label: "Stress", score: entry.stressLevel, fallbackComment: entry.comment)
        case .mentalLoad:
            return scoredSummary(label: "Charge mentale", score: entry.mentalLoad, fallbackComment: entry.comment)
        case .migraine:
            var parts: [String] = []
            if let level = entry.migraineLevel {
                parts.append(level.title)
            }
            if let pain = entry.migrainePainScore {
                parts.append("Douleur \(pain)/10")
            }
            if entry.migraineMedicationTaken == true {
                parts.append("Medicament pris")
            }
            if let comment = entry.comment {
                parts.append(comment)
            }
            return fallback(parts, title: "Migraine")
        case .caffeine:
            return enumSummary(label: "Cafeine", value: entry.caffeineLevel?.title, comment: entry.comment)
        case .physicalActivity:
            return enumSummary(label: "Activite", value: entry.physicalActivityLevel?.title, comment: entry.comment)
        case .meal:
            return enumSummary(label: "Repas", value: entry.mealType?.title, comment: entry.comment)
        case .nap:
            if let napDuration = entry.napDuration {
                return "Sieste \(napDuration) min"
            }
            return fallbackComment(entry.comment, title: "Sieste")
        case .screenTime:
            return enumSummary(label: "Temps d'ecran", value: entry.screenTimeLevel?.title, comment: entry.comment)
        case .medication:
            return entry.medicationNote ?? "Medicament enregistre"
        case .meditation:
            if let meditationDuration = entry.meditationDuration {
                if let comment = entry.comment {
                    return "Meditation \(meditationDuration) min - \(comment)"
                }
                return "Meditation \(meditationDuration) min"
            }
            return fallbackComment(entry.comment, title: "Meditation")
        case .notableEvent:
            return entry.eventNote ?? "Evenement enregistre"
        case .freeNote:
            return entry.freeNote ?? "Note libre"
        }
    }

    private static func scoredSummary(label: String, score: Int?, fallbackComment: String?) -> String {
        if let score {
            if let fallbackComment {
                return "\(label) \(score)/10 - \(fallbackComment)"
            }
            return "\(label) \(score)/10"
        }
        return fallbackComment(fallbackComment, title: label)
    }

    private static func enumSummary(label: String, value: String?, comment: String?) -> String {
        var parts: [String] = []
        if let value {
            parts.append("\(label) \(value.lowercased())")
        }
        if let comment {
            parts.append(comment)
        }
        return fallback(parts, title: label)
    }

    private static func fallbackComment(_ comment: String?, title: String) -> String {
        comment ?? title
    }

    private static func fallback(_ parts: [String], title: String) -> String {
        let filtered = parts.filter { $0.isEmpty == false }
        return filtered.isEmpty ? title : filtered.joined(separator: " - ")
    }

    private static func formattedHours(_ value: Double) -> String {
        let formatted = value.formatted(.number.precision(.fractionLength(value.rounded() == value ? 0 : 1)))
        return "\(formatted) h"
    }
}
