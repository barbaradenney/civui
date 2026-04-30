// CivUI — CivFileUpload for SwiftUI
// Accessible file upload following government design system patterns.
// Renders: label → hint → error → file picker button → file list (Section 508 compliant)

import SwiftUI
import UniformTypeIdentifiers

/// Uploaded file info for CivFileUpload.
public struct CivUploadedFile: Identifiable {
    public let id = UUID()
    public let url: URL
    public let name: String
    public let size: Int64

    public init(url: URL) {
        self.url = url
        self.name = url.lastPathComponent
        self.size = (try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int64) ?? 0
    }
}

/// Accessible file upload for government applications.
///
/// Uses SwiftUI's `.fileImporter` modifier for native file picking.
/// Shows a file list with remove buttons and validates file size.
///
/// Usage:
/// ```swift
/// CivFileUpload(
///     label: "Upload supporting documents",
///     files: $uploadedFiles,
///     accept: [.pdf, .jpeg, .png],
///     maxSize: 10_000_000,
///     multiple: true,
///     hint: "Accepted formats: PDF, JPEG, PNG. Maximum 10 MB per file."
/// )
/// ```
public struct CivFileUpload: View {
    // MARK: - Properties

    /// Visible label text.
    public let label: String

    /// Bound array of uploaded files.
    @Binding public var files: [CivUploadedFile]

    /// Accepted file types (UTType array).
    public var accept: [UTType]

    /// Whether multiple files can be selected.
    public var multiple: Bool

    /// Maximum file size in bytes (per file). 0 = unlimited.
    public var maxSize: Int64

    /// Maximum number of files. 0 = unlimited.
    public var maxFiles: Int

    /// Help text shown below the label.
    public var hint: String?

    /// Error message.
    public var error: String?

    /// Whether the upload is disabled.
    public var isDisabled: Bool

    /// Whether the upload is read-only (visible but non-interactive, no opacity change).
    public var isReadonly: Bool

    /// Whether a file is required.
    public var isRequired: Bool

    /// Called when files change.
    public var onChange: (([CivUploadedFile]) -> Void)?

    /// Custom browse button text. When non-empty, overrides the CivLocale default.
    public var browseText: String

    /// Custom remove button text. When non-empty, overrides the CivLocale default.
    public var removeText: String

    /// Called for analytics tracking (parallels `civ-analytics` event).
    public var onAnalytics: ((String, [String: Any]?) -> Void)?

    /// Whether to show file previews (images).
    public var showPreview: Bool

    /// Camera capture mode (e.g., "user", "environment").
    public var capture: String

    /// Upload variant (e.g., "default", "dropzone").
    public var variant: String

    /// Custom text for the drag-and-drop area.
    public var dragText: String

    /// Label text describing accepted file types.
    public var acceptedLabel: String

    /// Label text showing the maximum file size.
    public var maxSizeLabel: String

    /// Accessible label for the remove button.
    public var removeAriaLabel: String

    /// Accessible label for the files list.
    public var filesListLabel: String

    /// VoiceOver message when a file is added.
    public var fileAddedMessage: String

    /// VoiceOver message when a file is removed.
    public var fileRemovedMessage: String

    /// Error message when a file exceeds the size limit.
    public var fileSizeError: String

    /// Error message when a file type is not accepted.
    public var fileTypeError: String

    /// Error message when the max files limit is reached.
    public var maxFilesError: String

    /// Optional form state for centralized validation.
    public var formState: CivFormState?

    /// Field name for form state registration.
    public var formName: String?

    /// Comma-separated file names, matching the web component's form value pattern.
    public var value: String {
        files.map(\.name).joined(separator: ",")
    }

    // MARK: - Internal State

    @State private var isImporterPresented = false
    @State private var internalError: String?
    @Environment(\.colorScheme) private var colorScheme
    @FocusState private var focusedFileId: UUID?
    @FocusState private var isUploadButtonFocused: Bool

    // MARK: - Initializer

    public init(
        label: String,
        files: Binding<[CivUploadedFile]>,
        accept: [UTType] = [.data],
        multiple: Bool = false,
        maxSize: Int64 = 0,
        maxFiles: Int = 0,
        hint: String? = nil,
        error: String? = nil,
        isDisabled: Bool = false,
        isReadonly: Bool = false,
        isRequired: Bool = false,
        browseText: String = "",
        removeText: String = "",
        onChange: (([CivUploadedFile]) -> Void)? = nil,
        onAnalytics: ((String, [String: Any]?) -> Void)? = nil,
        showPreview: Bool = false,
        capture: String = "",
        variant: String = "default",
        dragText: String = "",
        acceptedLabel: String = "",
        maxSizeLabel: String = "",
        removeAriaLabel: String = "",
        filesListLabel: String = "",
        fileAddedMessage: String = "",
        fileRemovedMessage: String = "",
        fileSizeError: String = "",
        fileTypeError: String = "",
        maxFilesError: String = "",
        formState: CivFormState? = nil,
        formName: String? = nil
    ) {
        self.label = label
        self._files = files
        self.accept = accept
        self.multiple = multiple
        self.maxSize = maxSize
        self.maxFiles = maxFiles
        self.hint = hint
        self.error = error
        self.isDisabled = isDisabled
        self.isReadonly = isReadonly
        self.isRequired = isRequired
        self.browseText = browseText
        self.removeText = removeText
        self.onChange = onChange
        self.onAnalytics = onAnalytics
        self.showPreview = showPreview
        self.capture = capture
        self.variant = variant
        self.dragText = dragText
        self.acceptedLabel = acceptedLabel
        self.maxSizeLabel = maxSizeLabel
        self.removeAriaLabel = removeAriaLabel
        self.filesListLabel = filesListLabel
        self.fileAddedMessage = fileAddedMessage
        self.fileRemovedMessage = fileRemovedMessage
        self.fileSizeError = fileSizeError
        self.fileTypeError = fileTypeError
        self.maxFilesError = maxFilesError
        self.formState = formState
        self.formName = formName
    }

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
            // 1. Label
            labelView

            // 2. Hint
            if let hint, !hint.isEmpty {
                Text(hint)
                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Base.dark,
                        dark: CivTokens.DarkColors.Base.dark
                    ))
                    .accessibilityIdentifier("civ-hint")
            }

            // 3. Error
            if let displayError {
                Text(displayError)
                    .font(.system(size: CivTokens.Typography.FontSize.sm,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityIdentifier("civ-error")
            }

            // 4. Upload button
            Button(action: { isImporterPresented = true }) {
                HStack(spacing: CivTokens.Spacing._2) {
                    Image(systemName: "arrow.up.doc")
                        .font(.system(size: CivTokens.Typography.FontSize.base))

                    Text(browseText.isEmpty ? CivLocale.shared.t("fileUploadBrowseText") : browseText)
                        .font(.system(size: CivTokens.Typography.FontSize.base))
                }
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Primary.default_,
                    dark: CivTokens.DarkColors.Primary.default_
                ))
                .padding(.horizontal, CivTokens.Spacing._4)
                .padding(.vertical, CivTokens.Spacing._2)
                .background(adaptiveColor(
                    light: CivTokens.Colors.White.default_,
                    dark: CivTokens.DarkColors.White.default_
                ))
                .cornerRadius(CivTokens.Border.Radius.default_)
                .overlay(
                    RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)
                        .stroke(adaptiveColor(
                            light: CivTokens.Colors.Primary.default_,
                            dark: CivTokens.DarkColors.Primary.default_
                        ), lineWidth: CivTokens.Border.Width._2)
                )
            }
            .buttonStyle(.plain)
            .disabled(isDisabled || isReadonly)
            .opacity(isDisabled ? 0.5 : 1.0)
            .focused($isUploadButtonFocused)
            .accessibilityLabel(label)
            .accessibilityHint(accessibilityHintText)
            .fileImporter(
                isPresented: $isImporterPresented,
                allowedContentTypes: accept,
                allowsMultipleSelection: multiple
            ) { result in
                handleFileResult(result)
            }

            // 5. File list
            if !files.isEmpty {
                VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {
                    ForEach(files) { file in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(file.name)
                                    .font(.system(size: CivTokens.Typography.FontSize.sm,
                                                  weight: CivTokens.Typography.FontWeight.semibold))
                                    .foregroundColor(adaptiveColor(
                                        light: CivTokens.Colors.Base.darkest,
                                        dark: CivTokens.DarkColors.Base.darkest
                                    ))

                                Text(formatFileSize(file.size))
                                    .font(.system(size: CivTokens.Typography.FontSize.xs))
                                    .foregroundColor(adaptiveColor(
                                        light: CivTokens.Colors.Base.dark,
                                        dark: CivTokens.DarkColors.Base.dark
                                    ))
                            }

                            Spacer()

                            Button(action: { removeFile(file) }) {
                                Text(removeText.isEmpty ? CivLocale.shared.t("fileUploadRemoveText") : removeText)
                                    .font(.system(size: CivTokens.Typography.FontSize.sm))
                                    .foregroundColor(adaptiveColor(
                                        light: CivTokens.Colors.Error.default_,
                                        dark: CivTokens.DarkColors.Error.default_
                                    ))
                            }
                            .buttonStyle(.plain)
                            .disabled(isDisabled || isReadonly)
                            .focused($focusedFileId, equals: file.id)
                            .accessibilityLabel(CivLocale.shared.t("fileUploadRemoveAriaLabel").replacingOccurrences(of: "{name}", with: file.name))
                        }
                        .padding(CivTokens.Spacing._2)
                        .background(adaptiveColor(
                            light: CivTokens.Colors.Base.lightest,
                            dark: CivTokens.DarkColors.Base.lightest
                        ))
                        .cornerRadius(CivTokens.Border.Radius.default_)
                    }
                }
            }
        }
        .padding(.bottom, CivTokens.Spacing._4)
        .accessibilityElement(children: .contain)
        .onChange(of: error) { newError in
            if let newError, !newError.isEmpty {
                UIAccessibility.post(notification: .announcement, argument: newError)
            }
        }
    }

    // MARK: - File Handling

    private func handleFileResult(_ result: Result<[URL], Error>) {
        internalError = nil

        switch result {
        case .success(let urls):
            var newFiles: [CivUploadedFile] = []
            var errors: [String] = []

            for url in urls {
                guard url.startAccessingSecurityScopedResource() else { continue }
                defer { url.stopAccessingSecurityScopedResource() }

                let file = CivUploadedFile(url: url)

                if maxSize > 0 && file.size > maxSize {
                    errors.append(CivLocale.shared.t("fileUploadFileSizeError")
                        .replacingOccurrences(of: "{name}", with: file.name)
                        .replacingOccurrences(of: "{size}", with: formatFileSize(maxSize)))
                    continue
                }

                newFiles.append(file)
            }

            if maxFiles > 0 && multiple {
                let available = maxFiles - files.count
                if newFiles.count > available {
                    newFiles = Array(newFiles.prefix(available))
                    errors.append(CivLocale.shared.t("fileUploadMaxFilesError").replacingOccurrences(of: "{max}", with: "\(maxFiles)"))
                }
            }

            if !errors.isEmpty {
                internalError = errors.joined(separator: ". ")
            }

            if multiple {
                files.append(contentsOf: newFiles)
            } else if let first = newFiles.first {
                files = [first]
            }

            // Announce added files for VoiceOver
            let addedMsg = CivLocale.shared.t("fileUploadFileAddedMessage")
                .replacingOccurrences(of: "{count}", with: "\(newFiles.count)")
                .replacingOccurrences(of: "{total}", with: "\(files.count)")
            UIAccessibility.post(notification: .announcement, argument: addedMsg)

            onChange?(files)
            onAnalytics?("change", ["files": newFiles.map { $0.name }])

        case .failure(let error):
            internalError = error.localizedDescription
        }
    }

    private func removeFile(_ file: CivUploadedFile) {
        guard let index = files.firstIndex(where: { $0.id == file.id }) else { return }
        files.remove(at: index)
        if files.isEmpty { internalError = nil }

        // Announce removal for VoiceOver
        let remaining = files.count
        let announcement = CivLocale.shared.t("fileUploadFileRemovedMessage")
            .replacingOccurrences(of: "{total}", with: "\(remaining)")
        UIAccessibility.post(notification: .announcement, argument: announcement)

        // Move focus: to next remove button or upload button if no files remain
        if files.isEmpty {
            isUploadButtonFocused = true
        } else {
            let nextIndex = Swift.min(index, files.count - 1)
            focusedFileId = files[nextIndex].id
        }

        onChange?(files)
        onAnalytics?("change", ["files": files.map { $0.name }])
    }

    // MARK: - Helpers

    private var displayError: String? {
        if let error, !error.isEmpty { return error }
        return internalError
    }

    private func formatFileSize(_ bytes: Int64) -> String {
        if bytes < 1024 { return "\(bytes) B" }
        if bytes < 1024 * 1024 { return String(format: "%.1f KB", Double(bytes) / 1024) }
        return String(format: "%.1f MB", Double(bytes) / (1024 * 1024))
    }

    // MARK: - Subviews

    private var labelView: some View {
        HStack(spacing: CivTokens.Spacing._0_5) {
            Text(label)
                .font(.system(size: CivTokens.Typography.FontSize.base,
                              weight: CivTokens.Typography.FontWeight.bold))
                .foregroundColor(adaptiveColor(
                    light: CivTokens.Colors.Base.darkest,
                    dark: CivTokens.DarkColors.Base.darkest
                ))

            if isRequired {
                Text("*")
                    .font(.system(size: CivTokens.Typography.FontSize.base,
                                  weight: CivTokens.Typography.FontWeight.bold))
                    .foregroundColor(adaptiveColor(
                        light: CivTokens.Colors.Error.default_,
                        dark: CivTokens.DarkColors.Error.default_
                    ))
                    .accessibilityLabel("required")
            }
        }
    }

    // MARK: - Accessibility

    private var accessibilityHintText: String {
        var parts: [String] = []
        if let hint, !hint.isEmpty { parts.append(hint) }
        if let displayError { parts.append("Error: \(displayError)") }
        return parts.joined(separator: ". ")
    }

    // MARK: - Color Helper

    private func adaptiveColor(light: Color, dark: Color) -> Color {
        colorScheme == .dark ? dark : light
    }
}

// MARK: - Preview

#if DEBUG
struct CivFileUpload_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var files: [CivUploadedFile] = []

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    CivFileUpload(
                        label: "Upload supporting documents",
                        files: $files,
                        accept: [.pdf, .jpeg, .png],
                        multiple: true,
                        maxSize: 10_000_000,
                        hint: "Accepted formats: PDF, JPEG, PNG. Maximum 10 MB per file.",
                        isRequired: true
                    )
                }
                .padding()
            }
        }
    }

    static var previews: some View {
        PreviewWrapper()
            .previewDisplayName("Light")
        PreviewWrapper()
            .preferredColorScheme(.dark)
            .previewDisplayName("Dark")
    }
}
#endif
