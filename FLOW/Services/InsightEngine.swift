import Foundation

enum InsightEngine {
    static let notEnoughDataMessage = "Pas assez de donnees pour afficher des tendances fiables pour le moment."

    static func generateInsights(entries: [TrackingEntry]) -> [String] {
        var insights: [String] = []

        let averageEnergyByHour = AnalyticsService.averageEnergyByHour(entries: entries)
        if averageEnergyByHour.count >= 3,
           let lowestHour = averageEnergyByHour.min(by: { $0.average < $1.average }) {
            insights.append(timeOfDayInsight(for: lowestHour.hour))
        }

        if let comparison = AnalyticsService.compareFormWithLowSleep(entries: entries),
           comparison.delta <= -1.0,
           comparison.withSampleCount >= 2,
           comparison.withoutSampleCount >= 2 {
            insights.append("Les jours avec moins de 6h de sommeil semblent associes a une energie moyenne plus basse.")
        }

        if let comparison = AnalyticsService.compareMigraineWithHighStress(entries: entries),
           comparison.delta >= 0.5,
           comparison.withSampleCount >= 2,
           comparison.withoutSampleCount >= 2 {
            insights.append("Les migraines semblent plus frequentes les jours ou le stress est eleve.")
        }

        if let comparison = AnalyticsService.compareMigraineWithHighCaffeine(entries: entries),
           comparison.delta >= 0.5,
           comparison.withSampleCount >= 2,
           comparison.withoutSampleCount >= 2 {
            insights.append("Une cafeine elevee pourrait etre associee a des migraines plus frequentes sur tes donnees.")
        }

        if insights.isEmpty {
            return [notEnoughDataMessage]
        }

        return Array(insights.prefix(4))
    }

    private static func timeOfDayInsight(for hour: Int) -> String {
        switch hour {
        case 5..<12:
            return "Ton energie semble plus basse en fin de matinee."
        case 12..<17:
            return "Tu sembles plus fatiguee entre 14h et 17h."
        case 17..<22:
            return "Ton energie semble baisser en fin de journee."
        default:
            return "Tes check-ins de nuit semblent associes a une energie plus basse."
        }
    }
}
