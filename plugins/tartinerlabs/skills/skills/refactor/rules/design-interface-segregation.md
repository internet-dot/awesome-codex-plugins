---
title: Interface Segregation
impact: HIGH
tags: solid, interfaces, segregation
---

**Rule**: Large interfaces force implementors to handle methods they don't need. Split into focused interfaces.

### Incorrect

```ts
interface Repository {
  find(id: string): Promise<Entity>;
  findAll(): Promise<Entity[]>;
  create(data: CreateDTO): Promise<Entity>;
  update(id: string, data: UpdateDTO): Promise<Entity>;
  delete(id: string): Promise<void>;
  export(format: string): Promise<Buffer>;
  sendNotification(id: string): Promise<void>;
}
```

### Correct

```ts
interface ReadRepository {
  find(id: string): Promise<Entity>;
  findAll(): Promise<Entity[]>;
}

interface WriteRepository {
  create(data: CreateDTO): Promise<Entity>;
  update(id: string, data: UpdateDTO): Promise<Entity>;
  delete(id: string): Promise<void>;
}
```
