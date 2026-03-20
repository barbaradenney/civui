import XCTest
@testable import CivUI

final class CivFormStateTests: XCTestCase {
    private var formState: CivFormState!

    override func setUp() {
        formState = CivFormState()
    }

    override func tearDown() {
        formState = nil
    }

    // MARK: - Registration and Form Data

    func testRegisterAndGetFormData() {
        var nameValue = "Jane Doe"
        var emailValue = "jane@example.gov"

        formState.register(CivFormState.CivFieldRegistration(
            name: "name",
            label: "Full name",
            getValue: { nameValue },
            setValue: { nameValue = $0 }
        ))

        formState.register(CivFormState.CivFieldRegistration(
            name: "email",
            label: "Email",
            getValue: { emailValue },
            setValue: { emailValue = $0 }
        ))

        let data = formState.getFormData()
        XCTAssertEqual(data["name"], "Jane Doe")
        XCTAssertEqual(data["email"], "jane@example.gov")
        XCTAssertEqual(data.count, 2)
    }

    // MARK: - Required Validation

    func testValidateRequiredField() {
        var nameValue = ""
        var nameError = ""

        formState.register(CivFormState.CivFieldRegistration(
            name: "name",
            label: "Full name",
            getValue: { nameValue },
            setValue: { nameValue = $0 },
            isRequired: true,
            getError: { nameError },
            setError: { nameError = $0 }
        ))

        let isValid = formState.validate()
        XCTAssertFalse(isValid)
        XCTAssertEqual(formState.errors.count, 1)
        XCTAssertEqual(formState.errors.first?.fieldName, "name")
        XCTAssertTrue(nameError.contains("required"))

        // Fill in the field and re-validate
        nameValue = "Jane Doe"
        let isValidNow = formState.validate()
        XCTAssertTrue(isValidNow)
        XCTAssertTrue(formState.errors.isEmpty)
    }

    // MARK: - Custom Validation

    func testValidateCustomValidator() {
        var emailValue = "not-an-email"
        var emailError = ""

        formState.register(CivFormState.CivFieldRegistration(
            name: "email",
            label: "Email",
            getValue: { emailValue },
            setValue: { emailValue = $0 },
            getError: { emailError },
            setError: { emailError = $0 },
            validate: {
                if !emailValue.contains("@") {
                    return "Enter a valid email address"
                }
                return nil
            }
        ))

        let isValid = formState.validate()
        XCTAssertFalse(isValid)
        XCTAssertEqual(formState.errors.count, 1)
        XCTAssertEqual(emailError, "Enter a valid email address")

        // Fix the value and re-validate
        emailValue = "jane@example.gov"
        let isValidNow = formState.validate()
        XCTAssertTrue(isValidNow)
        XCTAssertTrue(formState.errors.isEmpty)
    }

    // MARK: - Reset

    func testReset() {
        var nameValue = "Jane Doe"
        var nameError = "Some error"

        formState.register(CivFormState.CivFieldRegistration(
            name: "name",
            label: "Full name",
            getValue: { nameValue },
            setValue: { nameValue = $0 },
            getError: { nameError },
            setError: { nameError = $0 }
        ))

        formState.reset()

        XCTAssertEqual(nameValue, "", "Reset should clear field values")
        XCTAssertEqual(nameError, "", "Reset should clear field errors")
        XCTAssertTrue(formState.errors.isEmpty, "Reset should clear form-level errors")
    }

    // MARK: - Clear Errors

    func testClearErrors() {
        var nameValue = ""
        var nameError = ""

        formState.register(CivFormState.CivFieldRegistration(
            name: "name",
            label: "Full name",
            getValue: { nameValue },
            setValue: { nameValue = $0 },
            isRequired: true,
            getError: { nameError },
            setError: { nameError = $0 }
        ))

        // Trigger validation to create errors
        formState.validate()
        XCTAssertFalse(formState.errors.isEmpty)
        XCTAssertFalse(nameError.isEmpty)

        // Clear errors — values should remain
        formState.clearErrors()
        XCTAssertTrue(formState.errors.isEmpty)
        XCTAssertEqual(nameError, "")
        XCTAssertEqual(nameValue, "", "clearErrors should not change field values")
    }

    // MARK: - PII Exclusion

    func testPiiExcludedFromFormData() {
        var nameValue = "Jane Doe"
        var ssnValue = "123-45-6789"

        formState.register(CivFormState.CivFieldRegistration(
            name: "name",
            label: "Full name",
            getValue: { nameValue },
            setValue: { nameValue = $0 },
            isPii: false
        ))

        formState.register(CivFormState.CivFieldRegistration(
            name: "ssn",
            label: "Social Security number",
            getValue: { ssnValue },
            setValue: { ssnValue = $0 },
            isPii: true
        ))

        let data = formState.getFormData()
        XCTAssertEqual(data["name"], "Jane Doe")
        XCTAssertNil(data["ssn"], "PII fields should be excluded from getFormData()")
        XCTAssertEqual(data.count, 1)

        // getAllFormData should include PII
        let allData = formState.getAllFormData()
        XCTAssertEqual(allData["ssn"], "123-45-6789")
        XCTAssertEqual(allData.count, 2)
    }

    // MARK: - Unregister

    func testUnregisterRemovesField() {
        var nameValue = "Jane"

        formState.register(CivFormState.CivFieldRegistration(
            name: "name",
            label: "Full name",
            getValue: { nameValue },
            setValue: { nameValue = $0 }
        ))

        formState.unregister("name")

        let data = formState.getFormData()
        XCTAssertNil(data["name"])
        XCTAssertTrue(data.isEmpty)
    }
}
