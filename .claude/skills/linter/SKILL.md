---
description: When linting code, checking for bugs / errors, creating new code, or modifying existing code
user-invocable: false
---

We must ensure that this project maintains high quality standards. To that end, you can run `yarn lint` within any project to see if that project has any lint issues. You can also run `yarn:lint` (and `yarn lint:fix`) at the root level of the monorepo to check for (and potentially fix) issues throughout all projects.

Whenever you make changes, you must automatically check for lint errors. If you find any, you must fix them. Confirm that your fix has worked by running the lint command again.
