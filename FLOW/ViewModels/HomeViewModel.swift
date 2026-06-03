import Foundation
import Observation

@Observable
final class HomeViewModel {
    var quickCheckInEnergyScore: Int = 5
    var quickCheckInStressLevel: Int = 5
    var visibleEntryTypes: [EntryType]
    var selectedEntryType: EntryType?

    init(visibleEntryTypes: [EntryType] = HomeViewModel.defaultVisibleEntryTypes) {
        self.visibleEntryTypes = visibleEntryTypes
    }

    static let defaultVisibleEntryTypes: [EntryType] = [
        .form,
        .sleep,
        .stress,
        .mentalLoad,
        .migraine,
        .caffeine,
        .physicalActivity,
        .meal,
        .nap,
        .screenTime,
        .medication,
        .meditation,
        .notableEvent,
        .freeNote,
    ]

    var availableEntryTypes: [EntryType] {
        Self.defaultVisibleEntryTypes
    }

    var quickCheckInEnergy: Int {
        get { quickCheckInEnergyScore }
        set { quickCheckInEnergyScore = min(max(newValue, 1), 10) }
    }

    var quickCheckInStress: Int {
        get { quickCheckInStressLevel }
        set { quickCheckInStressLevel = min(max(newValue, 1), 10) }
    }

    var quickCheckInSummary: String {
        "Energie \(quickCheckInEnergyScore)/10 - Stress \(quickCheckInStressLevel)/10"
    }

    func makeQuickCheckIn(notificationId: String? = nil, scheduledTime: Date? = nil, timestamp: Date = .now) -> TrackingEntry {
        if notificationId != nil || scheduledTime != nil {
            return TrackingEntry.makeScheduledCheckIn(
                timestamp: timestamp,
                energyScore: quickCheckInEnergyScore,
                stressLevel: quickCheckInStressLevel,
                notificationId: notificationId,
                scheduledTime: scheduledTime
            )
        }

        return TrackingEntry.makeManualCheckIn(
            timestamp: timestamp,
            energyScore: quickCheckInEnergyScore,
            stressLevel: quickCheckInStressLevel
        )
    }

    func makeQuickCheckInEntry() -> TrackingEntry {
        makeQuickCheckIn()
    }

    func resetQuickCheckIn() {
        quickCheckInEnergyScore = 5
        quickCheckInStressLevel = 5
    }
}
