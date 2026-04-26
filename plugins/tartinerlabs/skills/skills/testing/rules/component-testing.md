---
title: Component Testing
impact: HIGH
tags: react, testing-library, rtl, user-event, queries
---

**Rule**: Test React components from the user's perspective using React Testing Library.

### Query Priority

Use the most accessible query available. Prefer queries that reflect how users interact with the UI:

1. `getByRole` — buttons, headings, links, inputs with labels
2. `getByLabelText` — form inputs
3. `getByPlaceholderText` — inputs without visible labels
4. `getByText` — non-interactive text content
5. `getByTestId` — last resort only

#### Incorrect

```tsx
const { container } = render(<LoginForm />);
const input = container.querySelector('input[name="email"]');
const button = container.querySelector('button');
```

#### Correct

```tsx
render(<LoginForm />);
const input = screen.getByRole('textbox', { name: /email/i });
const button = screen.getByRole('button', { name: /sign in/i });
```

### Use `screen`

Always import and use `screen` rather than destructuring from `render`:

```tsx
import { render, screen } from '@testing-library/react';

render(<Header title="Dashboard" />);
expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
```

### User Events

Use `@testing-library/user-event` over `fireEvent` — it simulates real browser behaviour (focus, blur, keyboard events):

```tsx
import userEvent from '@testing-library/user-event';

it('should submit the form with user input', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByRole('textbox', { name: /email/i }), 'alice@example.com');
  await user.click(screen.getByRole('button', { name: /sign in/i }));

  expect(onSubmit).toHaveBeenCalledWith({ email: 'alice@example.com' });
});
```

### Async Patterns

Use `findBy*` queries or `waitFor` for content that appears after async operations:

```tsx
it('should display user data after loading', async () => {
  render(<UserProfile id="1" />);

  // findBy* waits for the element to appear
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});
```

For assertions that need retrying:

```tsx
import { waitFor } from '@testing-library/react';

it('should remove the item after deletion', async () => {
  const user = userEvent.setup();
  render(<TodoList />);

  await user.click(screen.getByRole('button', { name: /delete/i }));

  await waitFor(() => {
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
  });
});
```

### Avoid Implementation Details

Do not test internal state, lifecycle methods, or component instances. Test what the user sees and does.

#### Incorrect

```tsx
const { result } = renderHook(() => useCounter());
expect(result.current.count).toBe(0);
act(() => result.current.increment());
expect(result.current.count).toBe(1);
// Testing the hook directly instead of the component using it
```

#### Correct

```tsx
render(<Counter />);
expect(screen.getByText('Count: 0')).toBeInTheDocument();

await userEvent.setup().click(screen.getByRole('button', { name: /increment/i }));
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

Exception: `renderHook` is appropriate when testing shared custom hooks that are used across multiple components.
