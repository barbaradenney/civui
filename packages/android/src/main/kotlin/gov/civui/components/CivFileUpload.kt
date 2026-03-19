// CivUI — CivFileUpload for Jetpack Compose
// Accessible file upload with file list preview and remove capability.
// Renders: label -> hint -> error -> upload button -> file list (Section 508 compliant)

package gov.civui.components

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import gov.civui.tokens.CivTokens

/**
 * Represents an uploaded file with metadata.
 */
data class CivUploadedFile(
    val name: String,
    val size: Long,
    val uri: Uri,
)

/**
 * Format file size for display.
 */
private fun formatFileSize(bytes: Long): String {
    return when {
        bytes < 1024 -> "$bytes B"
        bytes < 1024 * 1024 -> "${"%.1f".format(bytes / 1024.0)} KB"
        else -> "${"%.1f".format(bytes / (1024.0 * 1024.0))} MB"
    }
}

/**
 * Accessible file upload component for government applications.
 *
 * Uses Android file picker via ActivityResultContracts. Shows a list
 * of uploaded files with remove buttons. Supports file type filtering,
 * size limits, and multiple file selection.
 *
 * Usage:
 * ```kotlin
 * var files by remember { mutableStateOf(listOf<CivUploadedFile>()) }
 * CivFileUpload(
 *     label = "Upload supporting documents",
 *     files = files,
 *     onFilesChange = { files = it },
 *     accept = listOf("application/pdf", "image/*"),
 *     multiple = true,
 * )
 * ```
 */
@Composable
fun CivFileUpload(
    label: String,
    files: List<CivUploadedFile>,
    onFilesChange: (List<CivUploadedFile>) -> Unit,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
    accept: List<String> = emptyList(),
    multiple: Boolean = false,
    maxSize: Long = 0,
    maxFiles: Int = 0,
    required: Boolean = false,
    disabled: Boolean = false,
    browseText: String = "Choose file",
    removeText: String = "Remove",
) {
    val isDark = isSystemInDarkTheme()
    val context = LocalContext.current

    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest
    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark
    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_
    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_
    val borderColor = if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light

    var currentError by remember { mutableStateOf(error) }

    // Update currentError when error prop changes
    if (error != currentError && error != null) {
        currentError = error
    }

    // File picker launcher for single file
    val singleFileLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument(),
    ) { uri: Uri? ->
        uri?.let {
            val cursor = context.contentResolver.query(uri, null, null, null, null)
            val nameIndex = cursor?.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME) ?: -1
            val sizeIndex = cursor?.getColumnIndex(android.provider.OpenableColumns.SIZE) ?: -1
            cursor?.moveToFirst()
            val name = if (nameIndex >= 0) cursor?.getString(nameIndex) ?: "Unknown" else "Unknown"
            val size = if (sizeIndex >= 0) cursor?.getLong(sizeIndex) ?: 0L else 0L
            cursor?.close()

            if (maxSize > 0 && size > maxSize) {
                currentError = "$name exceeds maximum file size of ${formatFileSize(maxSize)}"
                return@let
            }

            currentError = null
            val newFile = CivUploadedFile(name = name, size = size, uri = uri)
            onFilesChange(listOf(newFile))
        }
    }

    // File picker launcher for multiple files
    val multiFileLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenMultipleDocuments(),
    ) { uris: List<Uri> ->
        val newFiles = mutableListOf<CivUploadedFile>()
        val errors = mutableListOf<String>()

        for (uri in uris) {
            val cursor = context.contentResolver.query(uri, null, null, null, null)
            val nameIndex = cursor?.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME) ?: -1
            val sizeIndex = cursor?.getColumnIndex(android.provider.OpenableColumns.SIZE) ?: -1
            cursor?.moveToFirst()
            val name = if (nameIndex >= 0) cursor?.getString(nameIndex) ?: "Unknown" else "Unknown"
            val size = if (sizeIndex >= 0) cursor?.getLong(sizeIndex) ?: 0L else 0L
            cursor?.close()

            if (maxSize > 0 && size > maxSize) {
                errors.add("$name exceeds maximum file size of ${formatFileSize(maxSize)}")
                continue
            }

            newFiles.add(CivUploadedFile(name = name, size = size, uri = uri))
        }

        // Enforce maxFiles limit
        val combined = files + newFiles
        val finalFiles = if (maxFiles > 0 && combined.size > maxFiles) {
            errors.add("Maximum $maxFiles files allowed")
            combined.take(maxFiles)
        } else {
            combined
        }

        currentError = if (errors.isNotEmpty()) errors.joinToString(". ") else null
        onFilesChange(finalFiles)
    }

    val mimeTypes = accept.ifEmpty { listOf("*/*") }.toTypedArray()

    Column(
        modifier = modifier.padding(bottom = CivTokens.Spacing._4),
    ) {
        // 1. Label
        CivLabel(
            label = label,
            required = required,
            labelColor = labelColor,
            errorColor = errorColor,
        )

        // 2. Hint
        CivHint(text = hint, color = hintColor)

        // 3. Error
        CivError(text = currentError, color = errorColor)

        // 4. Upload button
        OutlinedButton(
            onClick = {
                if (multiple) {
                    multiFileLauncher.launch(mimeTypes)
                } else {
                    singleFileLauncher.launch(mimeTypes)
                }
            },
            enabled = !disabled,
            modifier = Modifier
                .alpha(if (disabled) 0.5f else 1f)
                .semantics {
                    contentDescription = buildString {
                        append(label)
                        if (required) append(", required")
                        append(". $browseText")
                    }
                },
            border = BorderStroke(CivTokens.Border.Width.default_, primaryColor),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = primaryColor,
            ),
        ) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = null,
                modifier = Modifier.padding(end = CivTokens.Spacing._2),
            )
            Text(browseText)
        }

        // Accept info
        if (accept.isNotEmpty()) {
            Text(
                text = "Accepted types: ${accept.joinToString(", ")}",
                style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm),
                color = hintColor,
                modifier = Modifier.padding(top = CivTokens.Spacing._1),
            )
        }

        if (maxSize > 0) {
            Text(
                text = "Maximum file size: ${formatFileSize(maxSize)}",
                style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm),
                color = hintColor,
                modifier = Modifier.padding(top = CivTokens.Spacing._0_5),
            )
        }

        // 5. File list
        if (files.isNotEmpty()) {
            Column(
                modifier = Modifier
                    .padding(top = CivTokens.Spacing._3)
                    .semantics {
                        contentDescription = "Uploaded files, ${files.size} files"
                        liveRegion = LiveRegionMode.Polite
                    },
            ) {
                files.forEachIndexed { index, file ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(
                                width = CivTokens.Border.Width.default_,
                                color = borderColor,
                                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),
                            )
                            .padding(
                                horizontal = CivTokens.Spacing._3,
                                vertical = CivTokens.Spacing._2,
                            )
                            .then(
                                if (index > 0) Modifier.padding(top = CivTokens.Spacing._1) else Modifier
                            ),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = file.name,
                                style = TextStyle(
                                    fontSize = CivTokens.Typography.FontSize.base,
                                    fontWeight = FontWeight.SemiBold,
                                ),
                                color = labelColor,
                            )
                            Text(
                                text = formatFileSize(file.size),
                                style = TextStyle(
                                    fontSize = CivTokens.Typography.FontSize.sm,
                                ),
                                color = hintColor,
                            )
                        }

                        IconButton(
                            onClick = {
                                val newFiles = files.toMutableList()
                                newFiles.removeAt(index)
                                onFilesChange(newFiles)
                            },
                            enabled = !disabled,
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "$removeText ${file.name}",
                                tint = errorColor,
                            )
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Preview

@Preview(showBackground = true, name = "CivFileUpload")
@Composable
private fun CivFileUploadPreview() {
    Column(modifier = Modifier.padding(16.dp)) {
        var files by remember { mutableStateOf(listOf<CivUploadedFile>()) }
        CivFileUpload(
            label = "Upload supporting documents",
            files = files,
            onFilesChange = { files = it },
            hint = "PDF or image files, up to 10 MB each",
            accept = listOf("application/pdf", "image/*"),
            multiple = true,
            maxSize = 10 * 1024 * 1024,
            required = true,
        )

        CivFileUpload(
            label = "Disabled upload",
            files = emptyList(),
            onFilesChange = {},
            disabled = true,
        )
    }
}
