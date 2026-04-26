---
title: Vitest Patterns
impact: HIGH
tags: vitest, mocking, vi, setup, teardown, globals
---

**Rule**: Use Vitest idioms correctly — globals mode, `vi` utilities, and proper setup/teardown.

### Globals Mode

Vitest provides `describe`, `it`, `expect`, `beforeEach`, and `afterEach` globally when `globals: true` is set in config. Do NOT import them from `vitest`.

#### Incorrect

```ts
import { describe, it, expect } from 'vitest';

describe('add', () => {
  it('should sum two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

#### Correct

```ts
// No imports needed for describe, it, expect
describe('add', () => {
  it('should sum two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

Only import `vi` when using mock utilities:

```ts
import { vi } from 'vitest';
```

### Mocking with `vi`

Use `vi.fn()` for standalone mocks, `vi.spyOn()` to wrap existing methods, and `vi.mock()` for module-level mocking.

```ts
import { vi } from 'vitest';

// Standalone mock
const onClick = vi.fn();

// Spy on an existing method
vi.spyOn(console, 'error').mockImplementation(() => {});

// Module mock
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' }),
}));
```

### Setup and Teardown

Use `beforeEach` / `afterEach` to reset shared state. Prefer `beforeEach` over `beforeAll` to isolate tests.

```ts
import { vi } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

### Assertions

Use specific matchers over generic ones:

| Instead of | Use |
|---|---|
| `toBe(true)` | `toBeTruthy()` or specific condition |
| `toBe(undefined)` | `toBeUndefined()` |
| `toBe(null)` | `toBeNull()` |
| `expect(arr.length).toBe(3)` | `toHaveLength(3)` |
| `expect(obj.key).toBeDefined()` | `toHaveProperty('key')` |

### Async Testing

Use `async/await` directly — Vitest handles promises natively:

```ts
it('should fetch user data', async () => {
  const user = await fetchUser('1');
  expect(user.name).toBe('Alice');
});
```

For rejected promises:

```ts
it('should throw for missing user', async () => {
  await expect(fetchUser('unknown')).rejects.toThrow('Not found');
});
```

### Config Detection

Check for Vitest configuration in this order:
1. `vitest.config.ts` / `vitest.config.js` (standalone config)
2. `vite.config.ts` / `vite.config.js` with a `test` block (inline config)
3. `vitest.workspace.ts` (monorepo setup)
