import Foundation
import Observation

@Observable
final class EntryFormViewModel {
    let entryType: EntryType
    var sourceType: SourceType
    var timestamp: Date
    var notificationId: String?
    var scheduledTime: Date?
    var completedFromNotification: Bool

    var energyScore: Int?
    var sleepDuration: Double?
    var sleepQuality: Int?
    var stressLevel: Int?
    var mentalLoad: Int?
    var migraineLevel: MigraineLevel?
    var migrainePainScore: Int?
    var migraineMedicationTaken: Bool?
    var migraineMedicationNote: String
    var caffeineLevel: CaffeineLevel?
    var physicalActivityLevel: PhysicalActivityLevel?
    var mealType: MealType?
    var napDuration: Int?
    var screenTimeLevel: ScreenTimeLevel?
    var medicationNote: String
    var meditationDuration: Int?
    var eventNote: String
    var freeNote: String
    var comment: String

    private var editingEntryID: UUID?

    init(
        entryType: EntryType,
        sourceType: SourceType = .spontaneous,
        existingEntry: TrackingEntry? = nil,
        timestamp: Date = .now,
        notificationId: String? = nil,
        scheduledTime: Date? = nil
    ) {
        self.entryType = existingEntry?.entryType ?? entryType
        self.sourceType = existingEntry?.sourceType ?? sourceType
        self.timestamp = existingEntry?.timestamp ?? timestamp
        self.notificationId = existingEntry?.notificationId ?? notificationId
        self.scheduledTime = existingEntry?.scheduledTime ?? scheduledTime
        self.completedFromNotification = existingEntry?.completedFromNotification ?? (notificationId != nil)

        self.energyScore = existingEntry?.energyScore
        self.sleepDuration = existingEntry?.sleepDuration
        self.sleepQuality = existingEntry?.sleepQuality
        self.stressLevel = existingEntry?.stressLevel
        self.mentalLoad = existingEntry?.mentalLoad
        self.migraineLevel = existingEntry?.migraineLevel
        self.migrainePainScore = existingEntry?.migrainePainScore
        self.migraineMedicationTaken = existingEntry?.migraineMedicationTaken
        self.migraineMedicationNote = existingEntry?.migraineMedicationNote ?? ""
        self.caffeineLevel = existingEntry?.caffeineLevel
        self.physicalActivityLevel = existingEntry?.physicalActivityLevel
        self.mealType = existingEntry?.mealType
        self.napDuration = existingEntry?.napDuration
        self.screenTimeLevel = existingEntry?.screenTimeLevel
        self.medicationNote = existingEntry?.medicationNote ?? ""
        self.meditationDuration = existingEntry?.meditationDuration
        self.eventNote = existingEntry?.eventNote ?? ""
        self.freeNote = existingEntry?.freeNote ?? ""
        self.comment = existingEntry?.comment ?? ""
        self.editingEntryID = existingEntry?.id

        if self.entryType == .checkIn {
            self.sourceType = .scheduledCheckIn
        }
        normalizeIrrelevantFields()
    }

    var isEditing: Bool {
        editingEntryID != nil
    }

    var title: String {
        isEditing ? "Modifier \(EntryDisplayConfig.config(for: entryType).shortTitle.lowercased())" : EntryDisplayConfig.config(for: entryType).title
    }

    var canSave: Bool {
        validationMessage == nil
    }

    var validationMessage: String? {
        switch entryType {
        case .checkIn:
            guard energyScore != nil else { return "L'energie est requise." }
            guard stressLevel != nil else { return "Le stress est requis." }
        case .form:
            guard energyScore != nil else { return "La forme est requise." }
        case .migraine:
            guard migraineLevel != nil || migrainePainScore != nil || migraineMedicationTaken == true || trimmed(comment) != nil else {
                return "Ajoute au moins un niveau, une douleur ou une note utile."
            }
        case .medication:
            guard trimmed(medicationNote) != nil else { return "Ajoute le nom ou la note du medicament." }
        case .notableEvent:
            guard trimmed(eventNote) != nil else { return "Ajoute un evenement." }
        case .freeNote:
            guard trimmed(freeNote) != nil else { return "Ajoute une note." }
        default:
            guard hasMeaningfulContent else { return "Ajoute au moins une information pour cette entree." }
        }

        if let sleepDuration, sleepDuration <= 0 { return "La duree de sommeil doit etre positive." }
        if let napDuration, napDuration <= 0 { return "La sieste doit etre positive." }
        if let meditationDuration, meditationDuration <= 0 { return "La meditation doit etre positive." }
        return nil
    }

    func makeEntry() -> TrackingEntry {
        let entry = TrackingEntry(
            id: editingEntryID ?? UUID(),
            timestamp: timestamp,
            entryType: entryType,
            sourceType: entryType == .checkIn ? .scheduledCheckIn : sourceType,
            notificationId: notificationId,
            scheduledTime: scheduledTime,
            completedFromNotification: completedFromNotification,
            energyScore: energyScore,
            sleepDuration: sleepDuration,
            sleepQuality: sleepQuality,
            stressLevel: stressLevel,
            mentalLoad: mentalLoad,
            migraineLevel: migraineLevel,
            migrainePainScore: migrainePainScore,
            migraineMedicationTaken: migraineMedicationTaken == true ? true : nil,
            migraineMedicationNote: migraineMedicationNote,
            caffeineLevel: caffeineLevel,
            physicalActivityLevel: physicalActivityLevel,
            mealType: mealType,
            napDuration: napDuration,
            screenTimeLevel: screenTimeLevel,
            medicationNote: medicationNote,
            meditationDuration: meditationDuration,
            eventNote: eventNote,
            freeNote: freeNote,
            comment: comment
        )
        entry.normalizeForEntryType()
        return entry
    }

    func applyChanges(to entry: TrackingEntry) {
        let normalizedEntry = makeEntry()
        entry.timestamp = normalizedEntry.timestamp
        entry.entryType = normalizedEntry.entryType
        entry.sourceType = normalizedEntry.sourceType
        entry.notificationId = normalizedEntry.notificationId
        entry.scheduledTime = normalizedEntry.scheduledTime
        entry.completedFromNotification = normalizedEntry.completedFromNotification
        entry.energyScore = normalizedEntry.energyScore
        entry.sleepDuration = normalizedEntry.sleepDuration
        entry.sleepQuality = normalizedEntry.sleepQuality
        entry.stressLevel = normalizedEntry.stressLevel
        entry.mentalLoad = normalizedEntry.mentalLoad
        entry.migraineLevel = normalizedEntry.migraineLevel
        entry.migrainePainScore = normalizedEntry.migrainePainScore
        entry.migraineMedicationTaken = normalizedEntry.migraineMedicationTaken
        entry.migraineMedicationNote = normalizedEntry.migraineMedicationNote
        entry.caffeineLevel = normalizedEntry.caffeineLevel
        entry.physicalActivityLevel = normalizedEntry.physicalActivityLevel
        entry.mealType = normalizedEntry.mealType
        entry.napDuration = normalizedEntry.napDuration
        entry.screenTimeLevel = normalizedEntry.screenTimeLevel
        entry.medicationNote = normalizedEntry.medicationNote
        entry.meditationDuration = normalizedEntry.meditationDuration
        entry.eventNote = normalizedEntry.eventNote
        entry.freeNote = normalizedEntry.freeNote
        entry.comment = normalizedEntry.comment
        entry.normalizeForEntryType()
    }

    func buildEntry(existing: TrackingEntry? = nil) -> TrackingEntry {
        if let existing {
            applyChanges(to: existing)
            return existing
        }
        return makeEntry()
    }

    func load(from entry: TrackingEntry) {
        editingEntryID = entry.id
        timestamp = entry.timestamp
        sourceType = entry.sourceType
        notificationId = entry.notificationId
        scheduledTime = entry.scheduledTime
        completedFromNotification = entry.completedFromNotification
        energyScore = entry.energyScore
        sleepDuration = entry.sleepDuration
        sleepQuality = entry.sleepQuality
        stressLevel = entry.stressLevel
        mentalLoad = entry.mentalLoad
        migraineLevel = entry.migraineLevel
        migrainePainScore = entry.migrainePainScore
        migraineMedicationTaken = entry.migraineMedicationTaken
        migraineMedicationNote = entry.migraineMedicationNote ?? ""
        caffeineLevel = entry.caffeineLevel
        physicalActivityLevel = entry.physicalActivityLevel
        mealType = entry.mealType
        napDuration = entry.napDuration
        screenTimeLevel = entry.screenTimeLevel
        medicationNote = entry.medicationNote ?? ""
        meditationDuration = entry.meditationDuration
        eventNote = entry.eventNote ?? ""
        freeNote = entry.freeNote ?? ""
        comment = entry.comment ?? ""
        normalizeIrrelevantFields()
    }

    func normalizeIrrelevantFields() {
        if entryType == .checkIn {
            sourceType = .scheduledCheckIn
        }

        switch entryType {
        case .checkIn:
            clearNonCheckInFields()
        case .form:
            clearAllExcept { [.energyScore, .comment] }
        case .sleep:
            clearAllExcept { [.sleepDuration, .sleepQuality, .comment] }
        case .stress:
            clearAllExcept { [.stressLevel, .comment] }
        case .mentalLoad:
            clearAllExcept { [.mentalLoad, .comment] }
        case .migraine:
            clearAllExcept { [.migraineLevel, .migrainePainScore, .migraineMedicationTaken, .migraineMedicationNote, .comment] }
        case .caffeine:
            clearAllExcept { [.caffeineLevel, .comment] }
        case .physicalActivity:
            clearAllExcept { [.physicalActivityLevel, .comment] }
        case .meal:
            clearAllExcept { [.mealType, .comment] }
        case .nap:
            clearAllExcept { [.napDuration, .comment] }
        case .screenTime:
            clearAllExcept { [.screenTimeLevel, .comment] }
        case .medication:
            clearAllExcept { [.medicationNote, .comment] }
        case .meditation:
            clearAllExcept { [.meditationDuration, .comment] }
        case .notableEvent:
            clearAllExcept { [.eventNote, .comment] }
        case .freeNote:
            clearAllExcept { [.freeNote] }
        }
    }

    private var hasMeaningfulContent: Bool {
        makeEntry().isValidForSaving
    }

    private func clearNonCheckInFields() {
        clearAllExcept { [.energyScore, .stressLevel] }
        notificationId = trimmed(notificationId)
    }

    private enum Field {
        case energyScore
        case sleepDuration
        case sleepQuality
        case stressLevel
        case mentalLoad
        case migraineLevel
        case migrainePainScore
        case migraineMedicationTaken
        case migraineMedicationNote
        case caffeineLevel
        case physicalActivityLevel
        case mealType
        case napDuration
        case screenTimeLevel
        case medicationNote
        case meditationDuration
        case eventNote
        case freeNote
        case comment
    }

    private func clearAllExcept(_ keep: () -> Set<Field>) {
        let keptFields = keep()

        if keptFields.contains(.energyScore) == false { energyScore = nil }
        if keptFields.contains(.sleepDuration) == false { sleepDuration = nil }
        if keptFields.contains(.sleepQuality) == false { sleepQuality = nil }
        if keptFields.contains(.stressLevel) == false { stressLevel = nil }
        if keptFields.contains(.mentalLoad) == false { mentalLoad = nil }
        if keptFields.contains(.migraineLevel) == false { migraineLevel = nil }
        if keptFields.contains(.migrainePainScore) == false { migrainePainScore = nil }
        if keptFields.contains(.migraineMedicationTaken) == false { migraineMedicationTaken = nil }
        if keptFields.contains(.migraineMedicationNote) == false { migraineMedicationNote = "" }
        if keptFields.contains(.caffeineLevel) == false { caffeineLevel = nil }
        if keptFields.contains(.physicalActivityLevel) == false { physicalActivityLevel = nil }
        if keptFields.contains(.mealType) == false { mealType = nil }
        if keptFields.contains(.napDuration) == false { napDuration = nil }
        if keptFields.contains(.screenTimeLevel) == false { screenTimeLevel = nil }
        if keptFields.contains(.medicationNote) == false { medicationNote = "" }
        if keptFields.contains(.meditationDuration) == false { meditationDuration = nil }
        if keptFields.contains(.eventNote) == false { eventNote = "" }
        if keptFields.contains(.freeNote) == false { freeNote = "" }
        if keptFields.contains(.comment) == false { comment = "" }
    }

    private func trimmed(_ value: String?) -> String? {
        guard let value else { return nil }
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }

}
