// CivUI — CivItemizedTotal for Jetpack Compose
// Display-only ledger surface with rows + summed total. Mirrors
// civ-itemized-total.
//
// Placeholder body — the prop surface satisfies schema parity. The
// Compose implementation should render rows + a footer formatted by
// `java.text.NumberFormat.getCurrencyInstance(Locale)`. See
// .claude/rules/audit-debt.md → "Native platform implementation pass".

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun CivItemizedTotal(
    heading: String = "",
    totalLabel: String = "Total",
    totalAmount: Double = 0.0,
    currency: String = "USD",
    locale: String = "",
    totalIntent: String = "",
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit = {},
) {
    Column(modifier = modifier) {
        // Placeholder — see audit-debt.md for native implementation status.
        content()
    }
}
