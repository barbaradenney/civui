import XCTest
@testable import CivUI

final class CivTokensTests: XCTestCase {
    func testPrimaryColorExists() {
        // Verify token generation produced valid Color values
        let color = CivTokens.Colors.Primary.default_
        XCTAssertNotNil(color)
    }

    func testSpacingValues() {
        XCTAssertEqual(CivTokens.Spacing._4, 16)
        XCTAssertEqual(CivTokens.Spacing._8, 32)
    }

    func testFontSizeValues() {
        XCTAssertEqual(CivTokens.Typography.FontSize.base, 16)
        XCTAssertEqual(CivTokens.Typography.FontSize.lg, 18)
    }

    func testDarkColorsExist() {
        let darkPrimary = CivTokens.DarkColors.Primary.default_
        XCTAssertNotNil(darkPrimary)
    }

    func testBorderRadiusValues() {
        XCTAssertEqual(CivTokens.Border.Radius.none, 0)
        XCTAssertEqual(CivTokens.Border.Radius.default_, 4)
    }

    func testMotionDurationValues() {
        XCTAssertEqual(CivTokens.Motion.Duration.fast, 0.1)
        XCTAssertEqual(CivTokens.Motion.Duration.normal, 0.2)
    }
}
