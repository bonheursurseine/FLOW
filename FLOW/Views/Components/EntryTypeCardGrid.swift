import SwiftUI

struct EntryTypeCardGrid: View {
    let entryTypes: [EntryType]
    let onSelect: (EntryType) -> Void

    private let columns = [GridItem(.adaptive(minimum: 146), spacing: 12)]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            ForEach(entryTypes) { entryType in
                let config = EntryDisplayConfig.config(for: entryType)

                Button {
                    onSelect(entryType)
                } label: {
                    VStack(alignment: .leading, spacing: 14) {
                        Image(systemName: config.systemImage)
                            .font(.title2)
                            .foregroundStyle(.accent)

                        Text(config.title)
                            .font(.headline)
                            .foregroundStyle(.primary)
                            .multilineTextAlignment(.leading)

                        Spacer(minLength: 0)
                    }
                    .frame(maxWidth: .infinity, minHeight: 110, alignment: .topLeading)
                    .padding(16)
                    .background(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .fill(Color(.secondarySystemBackground))
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }
}
