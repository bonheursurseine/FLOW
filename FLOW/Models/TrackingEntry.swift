import Foundation
import SwiftData

@Model
final class TrackingEntry {
    var id: UUID
    var timestamp: Date
    var entryTypeRawValue: String
    var sourceTypeRawValue: String
    var notificationId: String?
    var scheduledTime: Date?
    var completedFromNotification: Bool

    var energyScore: Int?
    var sleepDuration: Double?
    var sleepQuality: Int?
    var stressLevel: Int?
    var mentalLoad: Int?
    var migraineLevelRawValue: String?
    var migrainePainScore: Int?
    var migraineMedicationTaken: Bool?
    var migraineMedicationNote: String?
    var caffeineLevelRawValue: String?
    var physicalActivityLevelRawValue: String?
    var mealTypeRawValue: String?
    var napDuration: Int?
    var screenTimeLevelRawValue: String?
    var medicationNote: String?
    var meditationDuration: Int?
    var eventNote: String?
    var freeNote: String?
    var comment: String?

    init(
        id: UUID = UUID(),
        timestamp: Date = .now,
        entryType: EntryType,
        sourceType: SourceType,
        notificationId: String? = nil,
        scheduledTime: Date? = nil,
        completedFromNotification: Bool = false,
        energyScore: Int? = nil,
        sleepDuration: Double? = nil,
        sleepQuality: Int? = nil,
        stressLevel: Int? = nil,
        mentalLoad: Int? = nil,
        migraineLevel: MigraineLevel? = nil,
        migrainePainScore: Int? = nil,
        migraineMedicationTaken: Bool? = nil,
        migraineMedicationNote: String? = nil,
        caffeineLevel: CaffeineLevel? = nil,
        physicalActivityLevel: PhysicalActivityLevel? = nil,
        mealType: MealType? = nil,
        napDuration: Int? = nil,
        screenTimeLevel: ScreenTimeLevel? = nil,
        medicationNote: String? = nil,
        meditationDuration: Int? = nil,
        eventNote: String? = nil,
        freeNote: String? = nil,
        comment: String? = nil
    ) {
        self.id = id
        self.timestamp = timestamp
        self.entryTypeRawValue = entryType.rawValue
        self.sourceTypeRawValue = sourceType.rawValue
        self.notificationId = notificationId
        self.scheduledTime = scheduledTime
        self.completedFromNotification = completedFromNotification
        self.energyScore = energyScore
        self.sleepDuration = sleepDuration
        self.sleepQuality = sleepQuality
        self.stressLevel = stressLevel
        self.mentalLoad = mentalLoad
        self.migraineLevelRawValue = migraineLevel?.rawValue
        self.migrainePainScore = migrainePainScore
        self.migraineMedicationTaken = migraineMedicationTaken
        self.migraineMedicationNote = migraineMedicationNote
        self.caffeineLevelRawValue = caffeineLevel?.rawValue
        self.physicalActivityLevelRawValue = physicalActivityLevel?.rawValue
        self.mealTypeRawValue = mealType?.rawValue
        self.napDuration = napDuration
        self.screenTimeLevelRawValue = screenTimeLevel?.rawValue
        self.medicationNote = medicationNote
        self.meditationDuration = meditationDuration
        self.eventNote = eventNote
        self.freeNote = freeNote
        self.comment = comment
        normalizeForEntryType()
    }
}

extension TrackingEntry {
    var entryType: EntryType {
        get { EntryType(rawValue: entryTypeRawValue) ?? .freeNote }
        set { entryTypeRawValue = newValue.rawValue }
    }

    var sourceType: SourceType {
        get { SourceType(rawValue: sourceTypeRawValue) ?? .spontaneous }
        set { sourceTypeRawValue = newValue.rawValue }
    }

    var migraineLevel: MigraineLevel? {
        get { migraineLevelRawValue.flatMap(MigraineLevel.init(rawValue:)) }
        set { migraineLevelRawValue = newValue?.rawValue }
    }

    var caffeineLevel: CaffeineLevel? {
        get { caffeineLevelRawValue.flatMap(CaffeineLevel.init(rawValue:)) }
        set { caffeineLevelRawValue = newValue?.rawValue }
    }

    var physicalActivityLevel: PhysicalActivityLevel? {
        get { physicalActivityLevelRawValue.flatMap(PhysicalActivityLevel.init(rawValue:)) }
        set { physicalActivityLevelRawValue = newValue?.rawValue }
    }

    var mealType: MealType? {
        get { mealTypeRawValue.flatMap(MealType.init(rawValue:)) }
        set { mealTypeRawValue = newValue?.rawValue }
    }

    var screenTimeLevel: ScreenTimeLevel? {
        get { screenTimeLevelRawValue.flatMap(ScreenTimeLevel.init(rawValue:)) }
        set { screenTimeLevelRawValue = newValue?.rawValue }
    }

    var displayTitle: String {
        EntryDisplayConfig.config(for: entryType).title
    }

    var isScheduledCheckIn: Bool {
        entryType == .checkIn && sourceType == .scheduledCheckIn
    }

    static func makeScheduledCheckIn(
        timestamp: Date = .now,
        energyScore: Int,
        stressLevel: Int,
        notificationId: String? = nil,
        scheduledTime: Date? = nil
    ) -> TrackingEntry {
        TrackingEntry(
            timestamp: timestamp,
            entryType: .checkIn,
            sourceType: .scheduledCheckIn,
            notificationId: notificationId,
            scheduledTime: scheduledTime,
            completedFromNotification: notificationId != nil,
            energyScore: energyScore,
            stressLevel: stressLevel
        )
    }

    static func makeManualCheckIn(
        timestamp: Date = .now,
        energyScore: Int,
        stressLevel: Int
    ) -> TrackingEntry {
        TrackingEntry(
            timestamp: timestamp,
            entryType: .checkIn,
            sourceType: .spontaneous,
            completedFromNotification: false,
            energyScore: energyScore,
            stressLevel: stressLevel
        )
    }

    var isValidForSaving: Bool {
        switch entryType {
        case .checkIn:
            return energyScore != nil && stressLevel != nil
        case .form:
            return energyScore != nil
        case .sleep:
            return sleepDuration != nil || sleepQuality != nil || sanitized(comment) != nil
        case .stress:
            return stressLevel != nil || sanitized(comment) != nil
        case .mentalLoad:
            return mentalLoad != nil || sanitized(comment) != nil
        case .migraine:
            return migraineLevel != nil || migrainePainScore != nil || migraineMedicationTaken == true || sanitized(comment) != nil
        case .caffeine:
            return caffeineLevel != nil || sanitized(comment) != nil
        case .physicalActivity:
            return physicalActivityLevel != nil || sanitized(comment) != nil
        case .meal:
            return mealType != nil || sanitized(comment) != nil
        case .nap:
            return napDuration != nil || sanitized(comment) != nil
        case .screenTime:
            return screenTimeLevel != nil || sanitized(comment) != nil
        case .medication:
            return sanitized(medicationNote) != nil
        case .meditation:
            return meditationDuration != nil || sanitized(comment) != nil
        case .notableEvent:
            return sanitized(eventNote) != nil
        case .freeNote:
            return sanitized(freeNote) != nil
        }
    }

    func normalizeForEntryType() {
        energyScore = clampedScore(energyScore)
        sleepDuration = positiveDouble(sleepDuration)
        sleepQuality = clampedScore(sleepQuality)
        stressLevel = clampedScore(stressLevel)
        mentalLoad = clampedScore(mentalLoad)
        migrainePainScore = clampedScore(migrainePainScore)
        napDuration = positiveInt(napDuration)
        meditationDuration = positiveInt(meditationDuration)

        comment = sanitized(comment)
        migraineMedicationNote = sanitized(migraineMedicationNote)
        medicationNote = sanitized(medicationNote)
        eventNote = sanitized(eventNote)
        freeNote = sanitized(freeNote)

        switch entryType {
        case .checkIn:
            sourceType = .scheduledCheckIn
            sleepDuration = nil
            sleepQuality = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
            comment = nil
        case .form:
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
        case .sleep:
            energyScore = nil
            stressLevel = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
        case .stress:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
        case .mentalLoad:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
        case .migraine:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            mentalLoad = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
        case .caffeine:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
        case .physicalActivity:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
        case .meal:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
        case .nap:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
        case .screenTime:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
        case .medication:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            meditationDuration = nil
            eventNote = nil
            freeNote = nil
        case .meditation:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            eventNote = nil
            freeNote = nil
        case .notableEvent:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            freeNote = nil
        case .freeNote:
            energyScore = nil
            sleepDuration = nil
            sleepQuality = nil
            stressLevel = nil
            mentalLoad = nil
            migraineLevel = nil
            migrainePainScore = nil
            migraineMedicationTaken = nil
            migraineMedicationNote = nil
            caffeineLevel = nil
            physicalActivityLevel = nil
            mealType = nil
            napDuration = nil
            screenTimeLevel = nil
            medicationNote = nil
            meditationDuration = nil
            eventNote = nil
            comment = nil
        }
    }

    private func clampedScore(_ value: Int?) -> Int? {
        guard let value else { return nil }
        return min(max(value, 1), 10)
    }

    private func positiveDouble(_ value: Double?) -> Double? {
        guard let value, value > 0 else { return nil }
        return value
    }

    private func positiveInt(_ value: Int?) -> Int? {
        guard let value, value > 0 else { return nil }
        return value
    }

    private func sanitized(_ text: String?) -> String? {
        let trimmed = text?.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed?.isEmpty == false ? trimmed : nil
    }
}
