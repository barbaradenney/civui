/**
 * Tests for tools/lint-ios-stub-allowlist.ts.
 *
 * Tests target the pure body-detection function, since the lint's
 * I/O surface (reading from packages/ios/Sources/CivUI/) is verified
 * by running the lint itself in CI.
 */

import { describe, it, expect } from 'vitest';
import { isStubBody } from '../lint-ios-stub-allowlist.js';

describe('isStubBody', () => {
  it('detects body that is exactly EmptyView()', () => {
    const swift = `
public struct CivFoo: View {
    public init() {}

    public var body: some View {
        EmptyView()
    }
}
`;
    expect(isStubBody(swift)).toBe(true);
  });

  it('ignores comments inside the body', () => {
    const swift = `
public struct CivFoo: View {
    public var body: some View {
        // TODO: implement
        EmptyView()
    }
}
`;
    expect(isStubBody(swift)).toBe(true);
  });

  it('returns false when body has real content', () => {
    const swift = `
public struct CivFoo: View {
    public var body: some View {
        VStack {
            Text("Hello")
        }
    }
}
`;
    expect(isStubBody(swift)).toBe(false);
  });

  it('returns false when body has EmptyView with siblings', () => {
    const swift = `
public struct CivFoo: View {
    public var body: some View {
        Text("Hello")
        EmptyView()
    }
}
`;
    expect(isStubBody(swift)).toBe(false);
  });

  it('returns false when no body is declared', () => {
    const swift = `
public struct CivFoo: View {
    public init() {}
}
`;
    expect(isStubBody(swift)).toBe(false);
  });

  it('handles nested braces (closures) correctly', () => {
    // A body that returns EmptyView as the outer expression but
    // contains nested braces should still be detected only if the
    // OUTER expression is exactly EmptyView(). A real body with
    // closures should NOT be detected as a stub.
    const swift = `
public struct CivFoo: View {
    public var body: some View {
        Button(action: { print("hi") }) {
            Text("Click")
        }
    }
}
`;
    expect(isStubBody(swift)).toBe(false);
  });

  it('strips block comments inside the body', () => {
    const swift = `
public struct CivFoo: View {
    public var body: some View {
        /* TODO: implement this view
           * on multiple lines */
        EmptyView()
    }
}
`;
    expect(isStubBody(swift)).toBe(true);
  });
});
