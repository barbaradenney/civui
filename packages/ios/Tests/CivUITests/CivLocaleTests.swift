import XCTest
@testable import CivUI

final class CivLocaleTests: XCTestCase {
    override func tearDown() {
        CivLocale.shared.reset()
    }

    func testDefaultStringLookup() {
        XCTAssertEqual(CivLocale.shared.t("required"), "(required)")
    }

    func testOverrideString() {
        CivLocale.shared.setStrings(["required": "(obligatorio)"])
        XCTAssertEqual(CivLocale.shared.t("required"), "(obligatorio)")
    }

    func testResetRestoresDefaults() {
        CivLocale.shared.setStrings(["required": "xxx"])
        CivLocale.shared.reset()
        XCTAssertEqual(CivLocale.shared.t("required"), "(required)")
    }

    func testUnknownKeyReturnsKey() {
        XCTAssertEqual(CivLocale.shared.t("unknown_key"), "unknown_key")
    }

    func testMultipleOverrides() {
        CivLocale.shared.setStrings([
            "required": "(requerido)",
            "selectEmpty": "- Seleccionar -",
        ])
        XCTAssertEqual(CivLocale.shared.t("required"), "(requerido)")
        XCTAssertEqual(CivLocale.shared.t("selectEmpty"), "- Seleccionar -")
    }

    func testOverrideDoesNotAffectOtherKeys() {
        CivLocale.shared.setStrings(["required": "(obligatorio)"])
        // Other keys should still return their defaults
        XCTAssertEqual(CivLocale.shared.t("selectEmpty"), "- Select -")
    }

    func testAllStringsIncludesOverrides() {
        CivLocale.shared.setStrings(["required": "(obligatorio)"])
        let all = CivLocale.shared.allStrings()
        XCTAssertEqual(all["required"], "(obligatorio)")
        // Defaults should still be present
        XCTAssertEqual(all["selectEmpty"], "- Select -")
    }
}
