---
name: Native form state pattern
description: Plan for CivFormState object to provide validate/reset/getFormData on iOS and Android (replacing web's DOM-query approach)
type: project
---

## Native Form State Pattern Plan

### Problem
Web's `CivForm` queries DOM children to validate, reset, and collect form data:
```typescript
validate() { this.querySelectorAll('[data-civ-form-field]').forEach(...) }
reset() { fields.forEach(f => f.formResetCallback()) }
getFormData() { returns FormData from ElementInternals }
```
Native platforms can't walk child views/composables. Need a different architecture.

### Solution: CivFormState object

A shared state object that form fields register with. The form container uses it to validate, reset, and collect data.

### iOS Design

```swift
public class CivFormState: ObservableObject {
    @Published public var errors: [CivFormFieldError] = []
    private var fields: [String: CivFieldRegistration] = [:]

    public struct CivFieldRegistration {
        let name: String
        let getValue: () -> String
        let setValue: (String) -> Void
        let isRequired: Bool
        let getError: () -> String
        let setError: (String) -> Void
        let validate: () -> String? // returns error or nil
    }

    // Fields register themselves
    public func register(_ reg: CivFieldRegistration) {
        fields[reg.name] = reg
    }

    public func unregister(_ name: String) {
        fields.removeValue(forKey: name)
    }

    // Form-level operations
    public func validate() -> Bool {
        errors = []
        for (_, field) in fields {
            if let error = field.validate() {
                errors.append(CivFormFieldError(name: field.name, message: error))
                field.setError(error)
            }
        }
        return errors.isEmpty
    }

    public func reset() {
        errors = []
        fields.values.forEach { $0.setValue(""); $0.setError("") }
    }

    public func clearErrors() {
        errors = []
        fields.values.forEach { $0.setError("") }
    }

    public func getFormData() -> [String: String] {
        var data: [String: String] = [:]
        fields.forEach { data[$0.key] = $0.value.getValue() }
        return data
    }
}
```

**Usage:**
```swift
struct EnrollmentForm: View {
    @StateObject var formState = CivFormState()

    var body: some View {
        CivForm(state: formState, onSubmit: { handleSubmit() }) {
            CivTextInput(label: "Name", value: $name, formState: formState, name: "name", required: true)
            CivTextInput(label: "Email", value: $email, formState: formState, name: "email", required: true)
        }
    }

    func handleSubmit() {
        if formState.validate() {
            let data = formState.getFormData()
            // submit
        }
    }
}
```

### Android Design

```kotlin
class CivFormState {
    private val fields = mutableMapOf<String, CivFieldRegistration>()
    var errors by mutableStateOf<List<CivFormFieldError>>(emptyList())

    data class CivFieldRegistration(
        val name: String,
        val getValue: () -> String,
        val setValue: (String) -> Unit,
        val isRequired: Boolean,
        val getError: () -> String,
        val setError: (String) -> Unit,
        val validate: () -> String?, // returns error or null
    )

    fun register(reg: CivFieldRegistration) { fields[reg.name] = reg }
    fun unregister(name: String) { fields.remove(name) }

    fun validate(): Boolean {
        errors = emptyList()
        val newErrors = mutableListOf<CivFormFieldError>()
        fields.values.forEach { field ->
            field.validate()?.let { error ->
                newErrors.add(CivFormFieldError(field.name, error))
                field.setError(error)
            }
        }
        errors = newErrors
        return errors.isEmpty()
    }

    fun reset() { errors = emptyList(); fields.values.forEach { it.setValue(""); it.setError("") } }
    fun clearErrors() { errors = emptyList(); fields.values.forEach { it.setError("") } }
    fun getFormData(): Map<String, String> = fields.mapValues { it.value.getValue() }
}
```

**Usage:**
```kotlin
@Composable
fun EnrollmentForm() {
    val formState = remember { CivFormState() }
    CivForm(state = formState, onSubmit = { handleSubmit(formState) }) {
        CivTextInput(label = "Name", value = name, onValueChange = { name = it },
            formState = formState, name = "name", required = true)
    }
}
```

### Implementation Steps
1. Create `CivFormState` on both platforms
2. Add optional `formState` + `name` parameters to all form components
3. Components auto-register/unregister in onAppear/onDisappear (iOS) or DisposableEffect (Android)
4. Update CivForm to accept `state: CivFormState` and use it for validate/reset/error summary
5. Add tests for register/validate/reset/getFormData lifecycle
6. Document the pattern for consuming teams

### Key Decisions
- `formState` is optional — components work standalone without it
- Registration happens automatically when both `formState` and `name` are provided
- Validation is pluggable — each field provides its own `validate()` closure
- Required validation is built-in; custom validation via the closure
- PII fields excluded from `getFormData()` by checking a `pii` flag

### How to apply
Dedicated session — create CivFormState, update all components to optionally register. Estimate: ~3 hours.
