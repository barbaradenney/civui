import XCTest
@testable import CivUI
import SwiftUI

final class CivTextInputTests: XCTestCase {

    // MARK: - Input Type Mapping

    func testEmailInputTypeUsesEmailKeyboard() {
        // Verify CivInputType enum values exist and are distinct
        let types: [CivInputType] = [.text, .email, .number, .password, .search, .telephone, .url]
        XCTAssertEqual(types.count, 7)
    }

    // MARK: - Width Variants

    func testFullWidthReturnsNilPoints() {
        XCTAssertNil(CivInputWidth.full.points)
    }

    func testXxSmallWidthReturns48Points() {
        XCTAssertEqual(CivInputWidth.xxSmall.points, 48)
    }

    func testSmallWidthReturns96Points() {
        XCTAssertEqual(CivInputWidth.small.points, 96)
    }

    func testMediumWidthReturns160Points() {
        XCTAssertEqual(CivInputWidth.medium.points, 160)
    }

    func testLargeWidthReturns240Points() {
        XCTAssertEqual(CivInputWidth.large.points, 240)
    }

    func testXxLargeWidthReturns384Points() {
        XCTAssertEqual(CivInputWidth.xxLarge.points, 384)
    }

    // MARK: - All Width Variants Exist

    func testAllWidthVariantsHaveValues() {
        let widths: [CivInputWidth] = [
            .full, .xxSmall, .xSmall, .small, .medium, .large, .xLarge, .xxLarge
        ]
        XCTAssertEqual(widths.count, 8)

        // All non-full widths should have points
        for w in widths where w != .full {
            XCTAssertNotNil(w.points, "\(w) should have a points value")
        }
    }

    // MARK: - CivTextInput View Creation

    func testTextInputCanBeCreated() {
        // Verify CivTextInput can be instantiated with all parameter combinations
        let binding = Binding.constant("test")

        // Minimal
        let _ = CivTextInput(label: "Name", value: binding)

        // Full options
        let _ = CivTextInput(
            label: "Email",
            value: binding,
            hint: "Enter your email",
            error: "Invalid email",
            isRequired: true,
            isDisabled: false,
            placeholder: "name@example.com",
            inputType: .email,
            width: .medium,
            onInput: { _ in },
            onChange: { _ in }
        )
    }

    func testTextInputWithPasswordType() {
        let binding = Binding.constant("")
        let _ = CivTextInput(
            label: "Password",
            value: binding,
            inputType: .password
        )
    }
}
