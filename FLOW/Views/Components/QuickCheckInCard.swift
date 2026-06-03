import SwiftUI

struct QuickCheckInCard: View {
    @Binding var energy: Int
    @Binding var stress: Int
    let onSave: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Check-in rapide")
                .font(.title3.weight(.semibold))

            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Energie")
                    Spacer()
                    Text("\(energy)/10")
                        .foregroundStyle(.secondary)
                }
                Slider(value: Binding(
                    get: { Double(energy) },
                    set: { energy = Int($0.rounded()) }
                ), in: 1...10, step: 1)
                .tint(.orange)
            }

            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Stress")
                    Spacer()
                    Text("\(stress)/10")
                        .foregroundStyle(.secondary)
                }
                Slider(value: Binding(
                    get: { Double(stress) },
                    set: { stress = Int($0.rounded()) }
                ), in: 1...10, step: 1)
                .tint(.pink)
            }

            Button("Enregistrer", action: onSave)
                .buttonStyle(.borderedProminent)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
    }
}
