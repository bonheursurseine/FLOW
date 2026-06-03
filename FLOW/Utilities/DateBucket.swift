import Foundation

enum DateBucket {
    static var calendar: Calendar = .current

    static func startOfDay(for date: Date) -> Date {
        calendar.startOfDay(for: date)
    }

    static func hourComponent(for date: Date) -> Int {
        calendar.component(.hour, from: date)
    }

    static func weekBucket(for date: Date) -> Date {
        let components = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: date)
        return calendar.date(from: components) ?? startOfDay(for: date)
    }

    static func isWithinLast(days: Int, date: Date, referenceDate: Date = .now) -> Bool {
        guard let lowerBound = calendar.date(byAdding: .day, value: -days, to: referenceDate) else {
            return false
        }
        return date >= lowerBound && date <= referenceDate
    }

    static func sameDay(_ lhs: Date, _ rhs: Date) -> Bool {
        calendar.isDate(lhs, inSameDayAs: rhs)
    }
}
