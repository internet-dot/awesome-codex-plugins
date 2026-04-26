---
title: Eliminate God Objects
impact: HIGH
tags: god-object, exports, modularity
---

**Rule**: Files with excessive exports (>10) or mixed responsibilities should be split into focused modules.

### Incorrect

```ts
// utils.ts — catch-all utility file
export function formatDate() { /* ... */ }
export function formatCurrency() { /* ... */ }
export function validateEmail() { /* ... */ }
export function validatePhone() { /* ... */ }
export function parseCSV() { /* ... */ }
export function parseJSON() { /* ... */ }
export function hashPassword() { /* ... */ }
export function generateToken() { /* ... */ }
export function sendEmail() { /* ... */ }
export function logError() { /* ... */ }
export function retryWithBackoff() { /* ... */ }
```

### Correct

```ts
// format.ts
export function formatDate() { /* ... */ }
export function formatCurrency() { /* ... */ }

// validation.ts
export function validateEmail() { /* ... */ }
export function validatePhone() { /* ... */ }

// parsers.ts
export function parseCSV() { /* ... */ }
export function parseJSON() { /* ... */ }
```
