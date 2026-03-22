---
paths:
  - 'apps/web-app/src/**/*.tsx'
---

# React Rules

A module may only contain one component. If a module contains more than one component, then a folder should be created (with a name that appropriately describes the top-level component in that module) and that module should be moved within that folder. Then, any additional components that are needed should be created a sibling modules to that module. Finally, the top-level component should be exported from that folder via an `index.ts` barrel module.

If a component uses a React hook (e.g. `useEffect, useMemo, useCallback`, etc...) in a way that requires more than 4 lines, then that hook should be extracted into a sibling hooks module. If the name of the component's module is `MyComponent.tsx`, then the name of the sibling hooks module would be `MyComponent.hooks.tsx`. These custom hooks must have function names that are prefixed with `use`.
