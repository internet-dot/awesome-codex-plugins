---
title: Test Structure
impact: HIGH
tags: structure, aaa, naming, describe, it, colocation
---

**Rule**: Follow the AAA pattern, use clear naming, and colocate tests next to source files.

### AAA Pattern

Every test should have three distinct phases:

```ts
it('should return the sum of two numbers', () => {
  // Arrange
  const a = 2;
  const b = 3;

  // Act
  const result = add(a, b);

  // Assert
  expect(result).toBe(5);
});
```

Comments are optional when the phases are obvious, but keep the logical separation.

### Naming

- **`describe` blocks**: Name after the unit being tested (function, component, or class)
- **`it` blocks**: Always start with "should" and describe the expected behaviour

#### Incorrect

```ts
describe('tests', () => {
  it('test 1', () => { ... });
  it('works', () => { ... });
  it('formats USD with two decimal places', () => { ... });
});
```

#### Correct

```ts
describe('formatCurrency', () => {
  it('should format USD with two decimal places', () => { ... });
  it('should return "0.00" for zero input', () => { ... });
  it('should throw for negative amounts', () => { ... });
});
```

### Nesting

Nest `describe` blocks to group related scenarios. Avoid nesting deeper than 2 levels.

```ts
describe('UserService', () => {
  describe('create', () => {
    it('should create a user with valid input', () => { ... });
    it('should throw for duplicate email', () => { ... });
  });

  describe('delete', () => {
    it('should remove the user by ID', () => { ... });
  });
});
```

### One Concept per Test

Each `it` block should test one logical assertion. Multiple `expect` calls are fine if they verify the same concept.

#### Incorrect

```ts
it('should handle user creation', () => {
  const user = createUser({ name: 'Alice' });
  expect(user.name).toBe('Alice');
  expect(user.id).toBeDefined();

  const duplicate = () => createUser({ name: 'Alice' });
  expect(duplicate).toThrow();
});
```

#### Correct

```ts
it('should create a user with the given name', () => {
  const user = createUser({ name: 'Alice' });
  expect(user.name).toBe('Alice');
  expect(user.id).toBeDefined();
});

it('should throw when creating a duplicate user', () => {
  createUser({ name: 'Alice' });
  expect(() => createUser({ name: 'Alice' })).toThrow();
});
```

### File Naming and Location

- Colocate test files next to source: `user-service.ts` → `user-service.test.ts`
- Match the project's existing convention (`.test.ts` vs `.spec.ts`) — pick one, not both
- Component tests: `button.tsx` → `button.test.tsx`
