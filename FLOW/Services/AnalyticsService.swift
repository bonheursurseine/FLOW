import Foundation

enum AnalyticsService {
    struct ScorePoint: Equatable, Sendable {
        let date: Date
        let value: Double
    }

    struct HourlyAverage: Equatable, Sendable {
        let hour: Int
        let average: Double
        let sampleCount: Int
    }

    struct DailyAverage: Equatable, Sendable {
        let day: Date
        let average: Double
        let sampleCount: Int
    }

    struct WeeklyTotal: Equatable, Sendable {
        let weekStart: Date
        let total: Double
        let sessionCount: Int
    }

    struct ValueComparison: Equatable, Sendable {
        let withConditionAverage: Double
        let withoutConditionAverage: Double
        let withSampleCount: Int
        let withoutSampleCount: Int

        var delta: Double {
            withConditionAverage - withoutConditionAverage
        }
    }

    struct CountByHour: Equatable, Sendable {
        let hour: Int
        let count: Int
    }

    static func scheduledCheckIns(from entries: [TrackingEntry]) -> [TrackingEntry] {
        entries
            .filter { $0.entryType == .checkIn && $0.sourceType == .scheduledCheckIn }
            .sorted { $0.timestamp < $1.timestamp }
    }

    static func scheduledEnergyTrend(entries: [TrackingEntry]) -> [ScorePoint] {
        scheduledCheckIns(from: entries).compactMap { entry in
            guard let energyScore = entry.energyScore else { return nil }
            return ScorePoint(date: entry.timestamp, value: Double(energyScore))
        }
    }

    static func scheduledStressTrend(entries: [TrackingEntry]) -> [ScorePoint] {
        scheduledCheckIns(from: entries).compactMap { entry in
            guard let stressLevel = entry.stressLevel else { return nil }
            return ScorePoint(date: entry.timestamp, value: Double(stressLevel))
        }
    }

    static func averageEnergyByHour(entries: [TrackingEntry]) -> [HourlyAverage] {
        averageByHour(entries: scheduledCheckIns(from: entries), value: \.energyScore)
    }

    static func averageStressByHour(entries: [TrackingEntry]) -> [HourlyAverage] {
        averageByHour(entries: scheduledCheckIns(from: entries), value: \.stressLevel)
    }

    static func dailyFormAverage(entries: [TrackingEntry]) -> [DailyAverage] {
        dailyAverage(entries: entries.filter { $0.entryType == .form }, value: \.energyScore)
    }

    static func formTrendLast7Days(entries: [TrackingEntry], referenceDate: Date = .now) -> [DailyAverage] {
        dailyFormAverage(entries: entries).filter { DateBucket.isWithinLast(days: 7, date: $0.day, referenceDate: referenceDate) }
    }

    static func formTrendLast30Days(entries: [TrackingEntry], referenceDate: Date = .now) -> [DailyAverage] {
        dailyFormAverage(entries: entries).filter { DateBucket.isWithinLast(days: 30, date: $0.day, referenceDate: referenceDate) }
    }

    static func averageFormByHour(entries: [TrackingEntry], minimumSamplesPerHour: Int = 2) -> [HourlyAverage] {
        averageByHour(entries: entries.filter { $0.entryType == .form }, value: \.energyScore)
            .filter { $0.sampleCount >= minimumSamplesPerHour }
    }

    static func compareFormWithLowSleep(entries: [TrackingEntry]) -> ValueComparison? {
        compareFormAgainstCondition(entries: entries) { dayEntries in
            dayEntries.contains { $0.entryType == .sleep && ($0.sleepDuration ?? 0) < 6 }
        }
    }

    static func compareFormWithGoodSleepQuality(entries: [TrackingEntry]) -> ValueComparison? {
        compareFormAgainstCondition(entries: entries) { dayEntries in
            dayEntries.contains { $0.entryType == .sleep && ($0.sleepQuality ?? 0) >= 7 }
        }
    }

    static func compareFormWithHighStress(entries: [TrackingEntry]) -> ValueComparison? {
        compareFormAgainstCondition(entries: entries) { dayEntries in
            dayEntries.contains { $0.entryType == .stress && ($0.stressLevel ?? 0) >= 7 }
        }
    }

    static func compareFormWithHighMentalLoad(entries: [TrackingEntry]) -> ValueComparison? {
        compareFormAgainstCondition(entries: entries) { dayEntries in
            dayEntries.contains { $0.entryType == .mentalLoad && ($0.mentalLoad ?? 0) >= 7 }
        }
    }

    static func migraineFrequencyByDay(entries: [TrackingEntry]) -> [DailyAverage] {
        let migraines = entries.filter { $0.entryType == .migraine && $0.hasMigraineSignal }
        let grouped = Dictionary(grouping: migraines) { DateBucket.startOfDay(for: $0.timestamp) }
        return grouped.map { day, values in
            DailyAverage(day: day, average: Double(values.count), sampleCount: values.count)
        }
        .sorted { $0.day < $1.day }
    }

    static func migraineDistributionByHour(entries: [TrackingEntry]) -> [CountByHour] {
        let grouped = Dictionary(grouping: entries.filter { $0.entryType == .migraine && $0.hasMigraineSignal }) {
            DateBucket.hourComponent(for: $0.timestamp)
        }
        return grouped.map { hour, values in
            CountByHour(hour: hour, count: values.count)
        }
        .sorted { $0.hour < $1.hour }
    }

    static func averageMigraineIntensity(entries: [TrackingEntry]) -> Double? {
        let scores = entries
            .filter { $0.entryType == .migraine }
            .compactMap(\.migrainePainScore)
        guard scores.isEmpty == false else { return nil }
        return Double(scores.reduce(0, +)) / Double(scores.count)
    }

    static func compareMigraineWithHighStress(entries: [TrackingEntry]) -> ValueComparison? {
        compareMigraineAgainstCondition(entries: entries) { dayEntries in
            dayEntries.contains { ($0.stressLevel ?? 0) >= 7 }
        }
    }

    static func compareMigraineWithHighCaffeine(entries: [TrackingEntry]) -> ValueComparison? {
        compareMigraineAgainstCondition(entries: entries) { dayEntries in
            dayEntries.contains { $0.entryType == .caffeine && $0.caffeineLevel == .high }
        }
    }

    static func meditationSessionsPerWeek(entries: [TrackingEntry]) -> [WeeklyTotal] {
        let meditationEntries = entries.filter { $0.entryType == .meditation && ($0.meditationDuration ?? 0) > 0 }
        let grouped = Dictionary(grouping: meditationEntries) { DateBucket.weekBucket(for: $0.timestamp) }
        return grouped.map { weekStart, values in
            WeeklyTotal(
                weekStart: weekStart,
                total: Double(values.count),
                sessionCount: values.count
            )
        }
        .sorted { $0.weekStart < $1.weekStart }
    }

    static func meditationDurationPerWeek(entries: [TrackingEntry]) -> [WeeklyTotal] {
        let meditationEntries = entries.filter { $0.entryType == .meditation && ($0.meditationDuration ?? 0) > 0 }
        let grouped = Dictionary(grouping: meditationEntries) { DateBucket.weekBucket(for: $0.timestamp) }
        return grouped.map { weekStart, values in
            WeeklyTotal(
                weekStart: weekStart,
                total: Double(values.compactMap(\.meditationDuration).reduce(0, +)),
                sessionCount: values.count
            )
        }
        .sorted { $0.weekStart < $1.weekStart }
    }

    static func averageMeditationDuration(entries: [TrackingEntry]) -> Double? {
        let durations = entries
            .filter { $0.entryType == .meditation }
            .compactMap(\.meditationDuration)
        guard durations.isEmpty == false else { return nil }
        return Double(durations.reduce(0, +)) / Double(durations.count)
    }

    private static func averageByHour(entries: [TrackingEntry], value: KeyPath<TrackingEntry, Int?>) -> [HourlyAverage] {
        let grouped = Dictionary(grouping: entries) { DateBucket.hourComponent(for: $0.timestamp) }
        return grouped.compactMap { hour, items in
            let scores = items.compactMap { $0[keyPath: value] }
            guard scores.isEmpty == false else { return nil }
            return HourlyAverage(
                hour: hour,
                average: Double(scores.reduce(0, +)) / Double(scores.count),
                sampleCount: scores.count
            )
        }
        .sorted { $0.hour < $1.hour }
    }

    private static func dailyAverage(entries: [TrackingEntry], value: KeyPath<TrackingEntry, Int?>) -> [DailyAverage] {
        let grouped = Dictionary(grouping: entries) { DateBucket.startOfDay(for: $0.timestamp) }
        return grouped.compactMap { day, items in
            let scores = items.compactMap { $0[keyPath: value] }
            guard scores.isEmpty == false else { return nil }
            return DailyAverage(
                day: day,
                average: Double(scores.reduce(0, +)) / Double(scores.count),
                sampleCount: scores.count
            )
        }
        .sorted { $0.day < $1.day }
    }

    private static func compareFormAgainstCondition(
        entries: [TrackingEntry],
        condition: ([TrackingEntry]) -> Bool
    ) -> ValueComparison? {
        let formScoresByDay = Dictionary(grouping: entries.filter { $0.entryType == .form && $0.energyScore != nil }) {
            DateBucket.startOfDay(for: $0.timestamp)
        }
        let entriesByDay = Dictionary(grouping: entries) { DateBucket.startOfDay(for: $0.timestamp) }

        var withCondition: [Double] = []
        var withoutCondition: [Double] = []

        for (day, formEntries) in formScoresByDay {
            let average = Double(formEntries.compactMap(\.energyScore).reduce(0, +)) / Double(formEntries.count)
            let dayEntries = entriesByDay[day] ?? []
            if condition(dayEntries) {
                withCondition.append(average)
            } else {
                withoutCondition.append(average)
            }
        }

        return buildComparison(with: withCondition, without: withoutCondition)
    }

    private static func compareMigraineAgainstCondition(
        entries: [TrackingEntry],
        condition: ([TrackingEntry]) -> Bool
    ) -> ValueComparison? {
        let entriesByDay = Dictionary(grouping: entries) { DateBucket.startOfDay(for: $0.timestamp) }

        var withCondition = 0
        var withoutCondition = 0
        var withTotal = 0
        var withoutTotal = 0

        for dayEntries in entriesByDay.values {
            let migraineCount = dayEntries.filter { $0.entryType == .migraine && $0.hasMigraineSignal }.count
            if condition(dayEntries) {
                withCondition += migraineCount
                withTotal += 1
            } else {
                withoutCondition += migraineCount
                withoutTotal += 1
            }
        }

        guard withTotal > 0, withoutTotal > 0 else { return nil }
        return ValueComparison(
            withConditionAverage: Double(withCondition) / Double(withTotal),
            withoutConditionAverage: Double(withoutCondition) / Double(withoutTotal),
            withSampleCount: withTotal,
            withoutSampleCount: withoutTotal
        )
    }

    private static func buildComparison(with withValues: [Double], without withoutValues: [Double]) -> ValueComparison? {
        guard withValues.isEmpty == false, withoutValues.isEmpty == false else { return nil }
        return ValueComparison(
            withConditionAverage: withValues.reduce(0, +) / Double(withValues.count),
            withoutConditionAverage: withoutValues.reduce(0, +) / Double(withoutValues.count),
            withSampleCount: withValues.count,
            withoutSampleCount: withoutValues.count
        )
    }
}

private extension TrackingEntry {
    var hasMigraineSignal: Bool {
        migraineLevel != nil || (migrainePainScore ?? 0) > 0 || migraineMedicationTaken == true
    }
}
