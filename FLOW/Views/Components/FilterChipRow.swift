import SwiftUI

struct FilterChipRow<Option: Hashable & Identifiable>: View {
    let title: String
    let options: [Option]
    let optionTitle: (Option) -> String
    @Binding var selection: Option?

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                Button {
                    selection = nil
                } label: {
                    Text("Tous")
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(selection == nil ? Color.accentColor : Color(.secondarySystemBackground))
                        .foregroundStyle(selection == nil ? Color.white : Color.primary)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)

                ForEach(options) { option in
                    Button {
                        selection = option
                    } label: {
                        Text(optionTitle(option))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(selection == option ? Color.accentColor : Color(.secondarySystemBackground))
                            .foregroundStyle(selection == option ? Color.white : Color.primary)
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
    }
}
