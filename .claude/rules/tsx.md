---
paths:
  - 'apps/web-app/src/**/*.tsx'
---

# React Rules

A module may only contain one component. If a module contains more than one component, then a folder should be created (with a name that appropriately describes the top-level component in that module) and that module should be moved within that folder. Then, any additional components that are needed should be created in sibling modules to that module. Finally, the top-level component should be exported from that folder via an `index.ts` barrel module. For large components where such extraction is appropriate, this demonstrates the folder structure we want:

```
# Barrel module
./MyComponent/index.ts

# Top-level component
./MyComponent/MyComponent.tsx

# Hooks for MyComponent
./MyComponent/MyComponent.hooks.tsx

# Sibling Component (Used by MyComponent)
./MyComponent/Footer.tsx

# Sibling Component Hooks
./MyComponent/Footer.hooks.tsx
```

If a component uses a React hook (e.g. `useEffect, useMemo, useCallback`, etc...) in a way that requires more than 4 lines, then that hook should be extracted into a sibling `[ComponentName].hooks.tsx` hooks module. These custom hooks must have function names that are prefixed with `use`.

If a hook is used by _multiple_ components within such a folder, then those hooks should be placed in a shared `hooks.tsx` module.
