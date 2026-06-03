import SwiftUI
import SwiftData
import Charts

struct AnalyticsView: View {
    @Query(sort: \TrackingEntry.timestamp, order: .forward) private var entries: [TrackingEntry]

    var body: some View {
        NavigationStack {
            ScrollView {
                if entries.isEmpty {
                    ContentUnavailableView(
                        "Pas encore de donnees",
                        systemImage: "chart.bar.xaxis",
                        description: Text("Les graphiques apparaitront apres quelques entrees.")
                    )
                    .padding(.top, 80)
                } else {
                    VStack(alignment: .leading, spacing: 24) {
                        checkInCharts
                        formCharts
                        insightsSection
                    }
                    .padding()
                }
            }
            .navigationTitle("Analyse")
        }
    }

    private var checkInCharts: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Check-ins programmes")
                .font(.title3.weight(.semibold))

            if AnalyticsService.averageEnergyByHour(entries: entries).isEmpty {
                Text("Pas assez de check-ins programmes pour afficher une tendance.")
                    .foregroundStyle(.secondary)
            } else {
                Chart(AnalyticsService.averageEnergyByHour(entries: entries), id: \.hour) { item in
                    BarMark(
                        x: .value("Heure", item.hour.hourLabel),
                        y: .value("Energie moyenne", item.average)
                    )
                    .foregroundStyle(.orange.gradient)
                }
                .frame(height: 220)

                Chart(AnalyticsService.averageStressByHour(entries: entries), id: \.hour) { item in
                    BarMark(
                        x: .value("Heure", item.hour.hourLabel),
                        y: .value("Stress moyen", item.average)
                    )
                    .foregroundStyle(.pink.gradient)
                }
                .frame(height: 220)
            }
        }
    }

    private var formCharts: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Forme")
                .font(.title3.weight(.semibold))

            let dailyAverages = AnalyticsService.dailyFormAverage(entries: entries)

            if dailyAverages.isEmpty {
                Text("Pas assez d'entrees de forme pour afficher une moyenne quotidienne.")
                    .foregroundStyle(.secondary)
            } else {
                Chart(dailyAverages, id: \.day) { item in
                    LineMark(
                        x: .value("Jour", item.day, unit: .day),
                        y: .value("Forme moyenne", item.average)
                    )
                    .foregroundStyle(.teal)
                    .interpolationMethod(.catmullRom)
                }
                .frame(height: 220)
            }
        }
    }

    private var insightsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Insights")
                .font(.title3.weight(.semibold))

            ForEach(InsightEngine.generateInsights(entries: entries), id: \.self) { insight in
                InsightCardView(text: insight)
            }
        }
    }
}

private extension Int {
    var hourLabel: String {
        String(format: "%02dh", self)
    }
}
