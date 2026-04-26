---
title: Single Responsibility
impact: HIGH
tags: solid, single-responsibility, modules
---

**Rule**: A module or class should have one reason to change. Split files that handle unrelated concerns.

### Incorrect

```ts
// user-service.ts — handles auth, profile, and notifications
export function login(credentials: Credentials) { /* ... */ }
export function logout(userId: string) { /* ... */ }
export function updateProfile(userId: string, data: ProfileData) { /* ... */ }
export function getProfile(userId: string) { /* ... */ }
export function sendWelcomeEmail(userId: string) { /* ... */ }
export function sendPasswordReset(email: string) { /* ... */ }
```

### Correct

```ts
// auth-service.ts
export function login(credentials: Credentials) { /* ... */ }
export function logout(userId: string) { /* ... */ }

// profile-service.ts
export function updateProfile(userId: string, data: ProfileData) { /* ... */ }
export function getProfile(userId: string) { /* ... */ }

// notification-service.ts
export function sendWelcomeEmail(userId: string) { /* ... */ }
export function sendPasswordReset(email: string) { /* ... */ }
```
