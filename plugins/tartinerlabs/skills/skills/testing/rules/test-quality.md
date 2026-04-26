---
title: Test Quality
impact: MEDIUM
tags: quality, edge-cases, snapshots, mocking, coverage
---

**Rule**: Test behaviour, cover edge cases, and avoid brittle patterns.

### Test Behaviour, Not Implementation

Tests should verify what a function does, not how it does it. If you refactor internals without changing behaviour, tests should still pass.

#### Incorrect

```ts
it('should call the internal _validate method', () => {
  const spy = vi.spyOn(form, '_validate');
  form.submit({ name: 'Alice' });
  expect(spy).toHaveBeenCalled();
});
```

#### Correct

```ts
it('should reject submission with missing name', () => {
  const result = form.submit({ name: '' });
  expect(result.error).toBe('Name is required');
});
```

### Cover Edge Cases

Always test boundary conditions alongside the happy path:

- **Empty values**: `null`, `undefined`, `''`, `[]`, `{}`
- **Boundaries**: `0`, `-1`, `Number.MAX_SAFE_INTEGER`
- **Type coercion**: `0` vs `false`, `''` vs `null`
- **Error paths**: Invalid input, network failures, timeouts

```ts
describe('formatPrice', () => {
  it('should format a standard price', () => {
    expect(formatPrice(9.99)).toBe('$9.99');
  });

  it('should return "$0.00" for zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('should throw for negative values', () => {
    expect(() => formatPrice(-1)).toThrow();
  });

  it('should handle large numbers', () => {
    expect(formatPrice(1_000_000)).toBe('$1,000,000.00');
  });
});
```

### Avoid Snapshot Overuse

Snapshots are useful for catching unexpected changes in serialised output (e.g., config objects, API responses). Do NOT use them for UI rendering — they are brittle and produce meaningless diffs.

#### Incorrect

```tsx
it('should render correctly', () => {
  const { container } = render(<UserCard name="Alice" />);
  expect(container).toMatchSnapshot();
});
```

#### Correct

```tsx
it('should display the user name', () => {
  render(<UserCard name="Alice" />);
  expect(screen.getByText('Alice')).toBeInTheDocument();
});
```

Acceptable snapshot use:

```ts
it('should generate the expected config', () => {
  expect(buildConfig({ env: 'production' })).toMatchInlineSnapshot(`
    {
      "minify": true,
      "sourcemap": false,
    }
  `);
});
```

### Don't Mock What You Don't Own

Wrap third-party dependencies behind your own interface, then mock your wrapper.

#### Incorrect

```ts
vi.mock('axios', () => ({
  default: { get: vi.fn() },
}));
```

#### Correct

```ts
// api-client.ts — your wrapper
export const apiClient = {
  getUser: (id: string) => axios.get(`/users/${id}`).then((r) => r.data),
};

// user-service.test.ts — mock your wrapper
vi.mock('./api-client', () => ({
  apiClient: { getUser: vi.fn() },
}));
```

### No Skipped Tests Without Justification

Committed tests should not contain `test.skip` or `test.todo` without a comment explaining why and a tracking issue.

#### Incorrect

```ts
it.skip('should handle concurrent requests', () => { ... });
it.todo('should retry on failure');
```

#### Correct

```ts
// TODO(#123): Flaky due to race condition in CI — investigate timing
it.skip('should handle concurrent requests', () => { ... });
```
