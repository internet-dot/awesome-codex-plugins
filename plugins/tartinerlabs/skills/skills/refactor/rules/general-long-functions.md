---
title: Extract Long Functions
impact: HIGH
tags: long-functions, extract, single-responsibility
---

**Rule**: Functions exceeding ~40 lines likely do too many things. Extract cohesive blocks into named functions.

### Incorrect

```ts
function handleSubmit(data: FormData) {
  // 15 lines of validation...
  // 10 lines of transformation...
  // 15 lines of API call + error handling...
}
```

### Correct

```ts
function handleSubmit(data: FormData) {
  const errors = validateForm(data);
  if (errors.length > 0) return { errors };

  const payload = transformFormData(data);
  return submitToApi(payload);
}
```
