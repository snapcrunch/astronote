import { v4 as uuidv4 } from "uuid";
import type { Knex } from "knex";

const collections = [
  { name: "Personal" },
  { name: "Work" },
];

const seedNotes: { collection_id: number; title: string; content: string; tags: string[] }[] = [
  {
    collection_id: 1,
    title: "Getting Started with Zettelkasten",
    content: "# Getting Started with Zettelkasten\n\nThe **Zettelkasten** method is a personal knowledge management system developed by German sociologist *Niklas Luhmann*.\n\n## Core Principles\n\n1. **Atomicity** — Each note should contain one idea\n2. **Connectivity** — Notes should link to other notes\n3. **Use your own words** — Restate ideas rather than copying\n\n## Why It Works\n\nBy forcing yourself to express ideas in your own words and connect them to existing knowledge, you create a *web of understanding* that grows over time.\n\n> \"I don't think everything on my own. It happens mainly within the Zettelkasten.\" — Niklas Luhmann\n\nSee also: [Zettelkasten.de](https://zettelkasten.de/introduction/)",
    tags: ["learning", "notetaking", "productivity"],
  },
  {
    collection_id: 2,
    title: "Weekly Grocery List",
    content: "- Eggs\n- Whole milk\n- Sourdough bread\n- Avocados (x3)\n- Chicken thighs\n- Garlic\n- Olive oil\n- Spinach",
    tags: ["groceries", "personal"],
  },
  {
    collection_id: 1,
    title: "React useEffect Cleanup",
    content: "# useEffect Cleanup Functions\n\nAlways return a cleanup function from `useEffect` when setting up subscriptions or timers.\n\n```tsx\nuseEffect(() => {\n  const id = setInterval(() => {\n    console.log('tick');\n  }, 1000);\n\n  return () => clearInterval(id);\n}, []);\n```\n\n**Common mistake:** forgetting cleanup leads to memory leaks, especially with WebSocket connections and event listeners.",
    tags: ["javascript", "react", "webdev"],
  },
  {
    collection_id: 1,
    title: "Morning Routine",
    content: "1. Wake at 6:00 AM\n2. Glass of water\n3. 20 min meditation\n4. 30 min exercise\n5. Shower\n6. Breakfast\n7. Journal for 10 min",
    tags: ["health", "personal", "productivity"],
  },
  {
    collection_id: 2,
    title: "Book Notes: Deep Work by Cal Newport",
    content: "# Deep Work — Cal Newport\n\n## Key Thesis\n\n**Deep work** is the ability to focus without distraction on a cognitively demanding task. It is both *increasingly rare* and *increasingly valuable* in the modern economy.\n\n## The Four Rules\n\n### Rule 1: Work Deeply\n\nDecide on a **depth philosophy**:\n\n| Philosophy | Description | Example |\n|---|---|---|\n| Monastic | Eliminate all shallow work | Donald Knuth |\n| Bimodal | Dedicate defined stretches to deep work | Carl Jung |\n| Rhythmic | Build a daily habit | Chain method |\n| Journalistic | Fit deep work wherever you can | Walter Isaacson |\n\n### Rule 2: Embrace Boredom\n\nDon't use the internet for entertainment. Schedule breaks *from focus*, not breaks *from distraction*.\n\n### Rule 3: Quit Social Media\n\nApply the **craftsman approach** to tool selection: adopt a tool only if its positive impacts substantially outweigh its negative impacts.\n\n### Rule 4: Drain the Shallows\n\n- Schedule every minute of your day\n- Quantify the depth of every activity\n- Ask: *\"How long would it take to train a smart recent college graduate to do this task?\"*\n\n## Favorite Quotes\n\n> \"Who you are, what you think, feel, and do, what you love — is the sum of what you focus on.\"\n\n> \"Clarity about what matters provides clarity about what does not.\"\n\n## My Takeaway\n\nI need to **protect 3–4 hours** of uninterrupted work each morning. No Slack, no email. Phone in another room.",
    tags: ["books", "learning", "productivity"],
  },
  {
    collection_id: 2,
    title: "Git Cheat Sheet",
    content: "# Git Quick Reference\n\n## Branching\n\n```bash\ngit checkout -b feature/my-feature\ngit branch -d old-branch\ngit branch -a  # list all branches\n```\n\n## Stashing\n\n```bash\ngit stash\ngit stash pop\ngit stash list\n```\n\n## Undoing Things\n\n| Action | Command |\n|---|---|\n| Unstage a file | `git reset HEAD file.txt` |\n| Discard changes | `git checkout -- file.txt` |\n| Amend last commit | `git commit --amend` |\n| Revert a commit | `git revert <sha>` |",
    tags: ["devtools", "git", "webdev"],
  },
  {
    collection_id: 1,
    title: "Idea: Personal Dashboard",
    content: "Build a personal dashboard that aggregates:\n\n- **Weather** for my location\n- **Calendar** events for today\n- **Task list** from Todoist API\n- **News headlines** from RSS feeds\n\nStack: React + Vite, deployed on Vercel. Could use [OpenWeather API](https://openweathermap.org/api) for weather data.",
    tags: ["ideas", "react", "webdev"],
  },
  {
    collection_id: 2,
    title: "Pasta Carbonara Recipe",
    content: "# Pasta Carbonara\n\n**Serves:** 2 | **Time:** 20 min\n\n## Ingredients\n\n- 200g spaghetti\n- 100g guanciale (or pancetta), diced\n- 2 large egg yolks + 1 whole egg\n- 50g Pecorino Romano, finely grated\n- Freshly cracked black pepper\n\n## Instructions\n\n1. Boil pasta in well-salted water until *al dente*\n2. While pasta cooks, render guanciale in a cold pan over medium heat until crispy (~8 min)\n3. Whisk eggs, yolks, and cheese together in a bowl\n4. When pasta is done, **reserve 1 cup of pasta water** before draining\n5. Toss hot pasta into the guanciale pan (heat OFF)\n6. Quickly pour in egg mixture, tossing vigorously\n7. Add pasta water a splash at a time until silky\n8. Season generously with black pepper\n\n> **Tip:** Never add the egg mixture over direct heat — you'll get scrambled eggs instead of a sauce.",
    tags: ["cooking", "recipe"],
  },
  {
    collection_id: 1,
    title: "TypeScript Utility Types",
    content: "# Useful TypeScript Utility Types\n\n- `Partial<T>` — makes all props optional\n- `Required<T>` — makes all props required\n- `Pick<T, K>` — select subset of props\n- `Omit<T, K>` — remove subset of props\n- `Record<K, V>` — object type with keys K and values V\n- `ReturnType<T>` — extract return type of a function\n\n```ts\ntype User = {\n  id: number;\n  name: string;\n  email: string;\n};\n\ntype UserPreview = Pick<User, 'id' | 'name'>;\n// { id: number; name: string }\n```",
    tags: ["javascript", "typescript", "webdev"],
  },
  {
    collection_id: 2,
    title: "Meeting Notes: Q1 Planning",
    content: "**Date:** 2026-01-10\n**Attendees:** Sarah, Mike, Priya, Jordan\n\n---\n\n## Agenda\n\n1. Review Q4 results\n2. Set Q1 OKRs\n3. Resource allocation\n\n## Key Decisions\n\n- **Objective 1:** Improve onboarding flow → target 30% reduction in drop-off\n- **Objective 2:** Launch mobile MVP by end of March\n- **Objective 3:** Reduce P95 API latency to < 200ms\n\n## Action Items\n\n- [ ] Sarah: Draft onboarding wireframes by 1/17\n- [ ] Mike: Set up performance monitoring dashboard\n- [ ] Priya: Scope mobile feature set\n- [ ] Jordan: Hire 2 backend engineers\n\n## Notes\n\nMike raised concerns about the current database architecture scaling. We may need to consider **read replicas** or moving to a different data store for the search index. Priya suggested evaluating *Elasticsearch*.",
    tags: ["meetings", "work"],
  },
  {
    collection_id: 2,
    title: "Favorite Podcasts",
    content: "- **Lex Fridman Podcast** — long-form interviews\n- **Huberman Lab** — neuroscience & health\n- **Syntax** — web dev\n- **The Changelog** — open source\n- **Philosophize This!** — philosophy",
    tags: ["media", "personal"],
  },
  {
    collection_id: 1,
    title: "CSS Grid vs Flexbox",
    content: "# When to Use Grid vs Flexbox\n\n## Flexbox\n\nBest for **one-dimensional** layouts (row OR column).\n\n```css\n.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n```\n\n## Grid\n\nBest for **two-dimensional** layouts (rows AND columns).\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: 1fr 2fr 1fr;\n  gap: 16px;\n}\n```\n\n## Rule of Thumb\n\n| Scenario | Use |\n|---|---|\n| Navigation bar | Flexbox |\n| Card grid | Grid |\n| Centering one item | Flexbox |\n| Full page layout | Grid |\n| Sidebar + content | Grid |",
    tags: ["css", "webdev"],
  },
  {
    collection_id: 2,
    title: "Travel Packing Checklist",
    content: "## Essentials\n\n- [ ] Passport\n- [ ] Wallet & cards\n- [ ] Phone & charger\n- [ ] Headphones\n\n## Clothing\n\n- [ ] 5 t-shirts\n- [ ] 2 pants\n- [ ] 7 underwear/socks\n- [ ] 1 jacket\n- [ ] Sleepwear\n\n## Toiletries\n\n- [ ] Toothbrush & toothpaste\n- [ ] Deodorant\n- [ ] Sunscreen\n- [ ] Medications",
    tags: [],
  },
  {
    collection_id: 1,
    title: "Understanding Promise.all vs Promise.allSettled",
    content: "# Promise.all vs Promise.allSettled\n\n## Promise.all\n\n- Resolves when **all** promises resolve\n- **Rejects immediately** if any promise rejects\n- Use when all results are required\n\n## Promise.allSettled\n\n- Waits for **all** promises to settle (resolve or reject)\n- Never short-circuits\n- Use when you want results from all promises regardless of failures\n\n```js\nconst results = await Promise.allSettled([\n  fetch('/api/users'),\n  fetch('/api/posts'),\n  fetch('/api/comments'),\n]);\n\nconst succeeded = results.filter(r => r.status === 'fulfilled');\nconst failed = results.filter(r => r.status === 'rejected');\n```",
    tags: ["javascript", "webdev"],
  },
  {
    collection_id: 1,
    title: "Workout Plan: Push/Pull/Legs",
    content: "# PPL Split\n\n## Push Day (Monday/Thursday)\n\n| Exercise | Sets x Reps |\n|---|---|\n| Bench Press | 4x8 |\n| Overhead Press | 3x10 |\n| Incline DB Press | 3x12 |\n| Lateral Raises | 3x15 |\n| Tricep Pushdowns | 3x12 |\n\n## Pull Day (Tuesday/Friday)\n\n| Exercise | Sets x Reps |\n|---|---|\n| Deadlift | 4x5 |\n| Barbell Rows | 4x8 |\n| Pull-ups | 3xAMRAP |\n| Face Pulls | 3x15 |\n| Barbell Curls | 3x12 |\n\n## Legs Day (Wednesday/Saturday)\n\n| Exercise | Sets x Reps |\n|---|---|\n| Squats | 4x8 |\n| Romanian Deadlift | 3x10 |\n| Leg Press | 3x12 |\n| Leg Curls | 3x12 |\n| Calf Raises | 4x15 |\n\n**Rest:** Sunday\n\n*Progressive overload: increase weight by 2.5kg when you can complete all sets with good form.*",
    tags: ["fitness", "health"],
  },
  {
    collection_id: 2,
    title: "Vim Survival Guide",
    content: "The basics to not get stuck:\n\n- `i` — insert mode\n- `Esc` — back to normal mode\n- `:w` — save\n- `:q` — quit\n- `:wq` — save and quit\n- `dd` — delete line\n- `yy` — copy line\n- `p` — paste\n- `/search` — find text\n- `u` — undo",
    tags: ["devtools", "vim"],
  },
  {
    collection_id: 1,
    title: "Zustand Store Patterns",
    content: "\n# Zustand Best Practices\n\n## Basic Store\n\n```ts\nimport { create } from 'zustand';\n\ninterface BearState {\n  bears: number;\n  increase: () => void;\n}\n\nconst useBearStore = create<BearState>((set) => ({\n  bears: 0,\n  increase: () => set((state) => ({ bears: state.bears + 1 })),\n}));\n```\n\n## Slices Pattern\n\nSplit large stores into **slices** for better organization:\n\n```ts\nconst createUserSlice = (set) => ({\n  user: null,\n  setUser: (user) => set({ user }),\n});\n\nconst createSettingsSlice = (set) => ({\n  theme: 'light',\n  toggleTheme: () =>\n    set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),\n});\n```\n\n## Selectors\n\nAlways use **selectors** to avoid unnecessary re-renders:\n\n```ts\n// Bad — subscribes to entire store\nconst state = useBearStore();\n\n// Good — subscribes only to bears\nconst bears = useBearStore((s) => s.bears);\n```\n\n## Persist Middleware\n\n```ts\nimport { persist } from 'zustand/middleware';\n\nconst useStore = create(\n  persist(\n    (set) => ({ count: 0 }),\n    { name: 'my-store' }\n  )\n);\n```",
    tags: ["javascript", "react", "zustand"],
  },
  {
    collection_id: 2,
    title: "Quick Note",
    content: "Call dentist to reschedule appointment.",
    tags: ["personal"],
  },
  {
    collection_id: 1,
    title: "HTTP Status Codes",
    content: "# Common HTTP Status Codes\n\n| Code | Meaning |\n|---|---|\n| 200 | OK |\n| 201 | Created |\n| 204 | No Content |\n| 301 | Moved Permanently |\n| 304 | Not Modified |\n| 400 | Bad Request |\n| 401 | Unauthorized |\n| 403 | Forbidden |\n| 404 | Not Found |\n| 409 | Conflict |\n| 422 | Unprocessable Entity |\n| 429 | Too Many Requests |\n| 500 | Internal Server Error |\n| 502 | Bad Gateway |\n| 503 | Service Unavailable |",
    tags: ["reference", "webdev"],
  },
  {
    collection_id: 1,
    title: "Philosophy: Stoicism Notes",
    content: "# Stoicism\n\n## Key Figures\n\n- **Zeno of Citium** — founder\n- **Epictetus** — former slave, teacher\n- **Seneca** — Roman statesman & playwright\n- **Marcus Aurelius** — Roman emperor\n\n## Core Ideas\n\n### The Dichotomy of Control\n\nSome things are **up to us** (our opinions, desires, actions) and some things are **not up to us** (our body, reputation, external events).\n\n> \"Make the best use of what is in your power, and take the rest as it happens.\" — *Epictetus*\n\n### Virtue as the Sole Good\n\nThe Stoics held that **virtue** (wisdom, courage, justice, temperance) is the only true good. Everything else — wealth, health, reputation — is *preferred* but not necessary for a good life.\n\n### Amor Fati\n\nLove of fate. Accept and embrace everything that happens.\n\n> \"The impediment to action advances action. What stands in the way becomes the way.\" — *Marcus Aurelius*\n## Practical Exercises\n\n1. **Negative visualization** — Imagine losing what you have to increase gratitude\n2. **Voluntary discomfort** — Periodically practice hardship (cold showers, fasting)\n3. **Evening review** — Reflect on the day: What went well? What could improve?\n4. **View from above** — Zoom out and see your problems in the context of the cosmos",
    tags: ["learning", "philosophy", "stoicism"],
  },
  {
    collection_id: 2,
    title: "Docker Compose Basics",
    content: "# Docker Compose\n\n```yaml\nversion: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - '3000:3000'\n    volumes:\n      - .:/app\n    depends_on:\n      - db\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: myapp\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\nvolumes:\n  pgdata:\n```\n\nUseful commands:\n\n- `docker compose up -d` — start in background\n- `docker compose down` — stop and remove\n- `docker compose logs -f app` — follow logs\n- `docker compose exec app sh` — shell into container",
    tags: ["devops", "devtools", "docker"],
  },
  {
    collection_id: 2,
    title: "Interesting Words",
    content: "- **Sonder** — the realization that each passerby has a life as vivid as your own\n- **Petrichor** — the smell of earth after rain\n- **Saudade** — a deep emotional state of melancholic longing (Portuguese)\n- **Hygge** — a quality of coziness and comfort (Danish)\n- **Tsundoku** — acquiring books and letting them pile up unread (Japanese)",
    tags: [],
  },
  {
    collection_id: 1,
    title: "Database Indexing Strategy",
    content: "# Database Indexing Notes\n\n## When to Add an Index\n\n- Columns frequently used in `WHERE` clauses\n- Columns used in `JOIN` conditions\n- Columns used in `ORDER BY`\n- High-cardinality columns (many unique values)\n\n## When NOT to Index\n\n- Small tables (full scan is cheap)\n- Columns with low cardinality (e.g., boolean flags)\n- Tables with heavy write traffic (indexes slow down inserts)\n\n## Types\n\n| Type | Use Case |\n|---|---|\n| B-tree | Default, general purpose |\n| Hash | Equality comparisons only |\n| GIN | Full-text search, JSONB |\n| GiST | Geometric data, range queries |\n| BRIN | Very large, naturally ordered tables |\n\n## Composite Indexes\n\nOrder matters! Put the most selective column **first**.\n\n```sql\n-- Good: filters on status first, then date\nCREATE INDEX idx_orders ON orders (status, created_at);\n```\n\n> **Rule of thumb:** If a query is slow, check `EXPLAIN ANALYZE` before blindly adding indexes.",
    tags: ["databases", "performance", "sql"],
  },
  {
    collection_id: 2,
    title: "Reminder: Renew Domain",
    content: "Renew `mywebsite.dev` before **March 15, 2026**. Registrar: Namecheap.",
    tags: ["personal", "reminder"],
  },
  {
    collection_id: 1,
    title: "The Feynman Technique",
    content: "# The Feynman Technique\n\nA method for learning anything deeply:\n\n1. **Choose a concept** you want to understand\n2. **Explain it as if teaching a 12-year-old** — use simple language, no jargon\n3. **Identify gaps** — where you struggle to explain simply, you don't truly understand\n4. **Go back to the source material** and fill in the gaps\n5. **Simplify and use analogies**\n\n> \"If you can't explain it simply, you don't understand it well enough.\"\n\nThis works because *teaching forces active recall* and exposes shallow understanding.",
    tags: ["learning", "productivity"],
  },
  {
    collection_id: 2,
    title: "Espresso Dial-In Notes",
    content: "# Dialing In Espresso\n\n**Bean:** Ethiopia Yirgacheffe (light roast)\n**Grinder:** Niche Zero\n\n| Attempt | Dose | Yield | Time | Notes |\n|---|---|---|---|---|\n| 1 | 18g | 36g | 22s | Too fast, sour. Grind finer. |\n| 2 | 18g | 36g | 28s | Better. Slight sourness remains. |\n| 3 | 18g | 38g | 30s | Sweet, fruity, balanced. **Keep this.** |\n| 4 | 18g | 40g | 30s | Slightly watery. Back to 38g. |\n\n**Final recipe:** 18g in → 38g out → 30 seconds\n\nWater temp: 200°F. Pre-infusion: 5 seconds.",
    tags: ["coffee", "personal"],
  },
  {
    collection_id: 2,
    title: "REST API Design Principles",
    content: "# REST API Design\n\n## URL Structure\n\n- Use **nouns**, not verbs: `/users` not `/getUsers`\n- Use **plural** names: `/users` not `/user`\n- Nest for relationships: `/users/123/posts`\n\n## HTTP Methods\n\n| Method | Purpose | Idempotent |\n|---|---|---|\n| GET | Read | Yes |\n| POST | Create | No |\n| PUT | Replace | Yes |\n| PATCH | Partial update | Yes |\n| DELETE | Remove | Yes |\n\n## Response Codes\n\n- **200** for successful GET/PUT/PATCH\n- **201** for successful POST (include `Location` header)\n- **204** for successful DELETE\n- **400** for validation errors\n- **404** for not found\n\n## Pagination\n\n```\nGET /api/posts?page=2&limit=20\n```\n\nReturn metadata:\n\n```json\n{\n  \"data\": [...],\n  \"meta\": {\n    \"page\": 2,\n    \"limit\": 20,\n    \"total\": 145\n  }\n}\n```",
    tags: ["api", "reference", "webdev"],
  },
  {
    collection_id: 1,
    title: "Movie Watchlist",
    content: "- [ ] *Oppenheimer* (2023)\n- [ ] *Past Lives* (2023)\n- [x] *The Holdovers* (2023)\n- [ ] *Perfect Days* (2023)\n- [x] *Dune: Part Two* (2024)\n- [ ] *All We Imagine as Light* (2024)\n- [ ] *The Brutalist* (2024)",
    tags: [],
  },
  {
    collection_id: 1,
    title: "SSH Key Setup",
    content: "```bash\n# Generate a new ED25519 key\nssh-keygen -t ed25519 -C \"me@example.com\"\n\n# Start the agent\neval \"$(ssh-agent -s)\"\n\n# Add the key\nssh-add ~/.ssh/id_ed25519\n\n# Copy public key to clipboard (macOS)\npbcopy < ~/.ssh/id_ed25519.pub\n```\n\nThen paste into GitHub → Settings → SSH Keys.",
    tags: ["devtools", "git"],
  },
  {
    collection_id: 2,
    title: "Cognitive Biases to Watch For",
    content: "# Cognitive Biases\n\n## Decision Making\n\n- **Confirmation bias** — Seeking info that confirms existing beliefs\n- **Anchoring** — Over-relying on the first piece of information\n- **Sunk cost fallacy** — Continuing because of past investment\n- **Availability heuristic** — Judging likelihood by how easily examples come to mind\n\n## Social\n\n- **Bandwagon effect** — Doing something because others do\n- **Dunning-Kruger effect** — Overestimating competence in areas of low skill\n- **Halo effect** — Letting one positive trait influence overall judgment\n\n## Memory\n\n- **Hindsight bias** — \"I knew it all along\"\n- **Peak-end rule** — Judging experiences by their peak and end, not the average\n- **Recency bias** — Giving more weight to recent events\n\n> Awareness doesn't eliminate biases, but it helps you **build systems** to counteract them (checklists, devil's advocates, pre-mortems).",
    tags: ["learning", "psychology"],
  },
  {
    collection_id: 1,
    title: "npm vs pnpm vs yarn",
    content: "| Feature | npm | pnpm | yarn |\n|---|---|---|---|\n| Disk usage | High (copies) | Low (hard links) | Medium |\n| Speed | Moderate | Fast | Fast |\n| Monorepo support | Workspaces | Excellent | Workspaces |\n| Lock file | package-lock.json | pnpm-lock.yaml | yarn.lock |\n| Strictness | Hoists by default | Strict by default | Hoists by default |\n\n**My preference:** pnpm for monorepos, npm for simple projects.",
    tags: ["devtools", "javascript"],
  },
  {
    collection_id: 2,
    title: "Gratitude Log — February 2026",
    content: "\n**Feb 1** — Great coffee and a productive morning.\n\n**Feb 5** — Long walk in the park with clear skies.\n\n**Feb 12** — Finished the book I've been reading for months.\n\n**Feb 14** — Cooked dinner for friends. Good conversations.\n\n**Feb 20** — Finally fixed that bug that's been haunting me for a week.\n\n**Feb 27** — Quiet evening at home. Sometimes that's all you need.",
    tags: ["journal", "personal"],
  },
  {
    collection_id: 2,
    title: "Regex Quick Reference",
    content: "# Regular Expressions\n\n## Character Classes\n\n- `.` — any character\n- `\\d` — digit\n- `\\w` — word character (letter, digit, underscore)\n- `\\s` — whitespace\n- `[abc]` — a, b, or c\n- `[^abc]` — not a, b, or c\n\n## Quantifiers\n\n- `*` — 0 or more\n- `+` — 1 or more\n- `?` — 0 or 1\n- `{3}` — exactly 3\n- `{2,5}` — between 2 and 5\n\n## Anchors\n\n- `^` — start of string\n- `$` — end of string\n- `\\b` — word boundary\n\n## Common Patterns\n\n```\nEmail:  ^[\\w.-]+@[\\w.-]+\\.\\w{2,}$\nURL:    https?://[\\w.-]+(/[\\w.-]*)*\nIP:     \\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\n```",
    tags: [],
  },
  {
    collection_id: 1,
    title: "Home Office Ergonomics",
    content: "## Monitor\n\n- Top of screen at or slightly below **eye level**\n- About an **arm's length** away\n- Slight downward gaze (~15–20°)\n\n## Chair\n\n- Feet flat on the floor\n- Knees at ~90° angle\n- Lumbar support in the curve of your lower back\n\n## Keyboard & Mouse\n\n- Elbows at ~90°, close to body\n- Wrists **neutral** (not angled up or down)\n- Consider a split keyboard for better posture\n\n**Take a break every 30 minutes.** Stand, stretch, look at something 20 feet away for 20 seconds.",
    tags: [],
  },
  {
    collection_id: 1,
    title: "Zustand vs Redux vs Context",
    content: "\n# State Management Comparison\n\n## React Context\n\n**Pros:** Built-in, no extra deps\n**Cons:** Re-renders all consumers on any change. Not suitable for frequent updates.\n\n## Redux Toolkit\n\n**Pros:** Mature ecosystem, devtools, middleware\n**Cons:** Verbose boilerplate, steep learning curve\n\n## Zustand\n\n**Pros:** Minimal API, no providers needed, selective subscriptions\n**Cons:** Smaller ecosystem, less opinionated\n\n---\n\n**Verdict:** For this project, **Zustand** is the right choice. We have moderate state complexity and want minimal boilerplate. Redux would be overkill. Context would cause performance issues with frequent note updates.",
    tags: ["javascript", "react", "zustand"],
  },
  {
    collection_id: 2,
    title: "Birthday Gift Ideas",
    content: "### For Mom (April 2)\n- Ceramic plant pot from that shop downtown\n- Cookbook: *Salt Fat Acid Heat*\n\n### For Jake (May 18)\n- Mechanical keyboard (he mentioned wanting one)\n- Board game: *Wingspan*",
    tags: [],
  },
  {
    collection_id: 1,
    title: "PostgreSQL JSON Queries",
    content: "\n# Working with JSONB in PostgreSQL\n\n## Operators\n\n| Operator | Description | Example |\n|---|---|---|\n| `->` | Get JSON element (as JSON) | `data->'name'` |\n| `->>` | Get JSON element (as text) | `data->>'name'` |\n| `@>` | Contains | `data @> '{\"active\": true}'` |\n| `?` | Key exists | `data ? 'name'` |\n\n## Examples\n\n```sql\n-- Find users with a specific tag\nSELECT * FROM users\nWHERE tags @> '[\"admin\"]';\n\n-- Index for fast JSONB lookups\nCREATE INDEX idx_users_tags ON users USING GIN (tags);\n\n-- Extract nested value\nSELECT data->'address'->>'city' AS city\nFROM users;\n```",
    tags: ["databases", "postgresql", "sql"],
  },
  {
    collection_id: 2,
    title: "Breathing Exercises",
    content: "## Box Breathing (4-4-4-4)\n\n1. Inhale for **4 seconds**\n2. Hold for **4 seconds**\n3. Exhale for **4 seconds**\n4. Hold for **4 seconds**\n\nRepeat 4 times. Used by Navy SEALs for stress management.\n\n## 4-7-8 Technique\n\n1. Inhale for **4 seconds**\n2. Hold for **7 seconds**\n3. Exhale for **8 seconds**\n\nGood for falling asleep.",
    tags: ["health", "wellness"],
  },
  {
    collection_id: 1,
    title: "Material UI Theme Customization",
    content: "# MUI Theme Setup\n\n```tsx\nimport { createTheme, ThemeProvider } from '@mui/material/styles';\n\nconst theme = createTheme({\n  palette: {\n    primary: {\n      main: '#1976d2',\n    },\n    secondary: {\n      main: '#dc004e',\n    },\n    background: {\n      default: '#f5f5f5',\n      paper: '#ffffff',\n    },\n  },\n  typography: {\n    fontFamily: '\"Roboto\", \"Helvetica\", \"Arial\", sans-serif',\n    h1: {\n      fontSize: '2.5rem',\n      fontWeight: 500,\n    },\n  },\n  components: {\n    MuiButton: {\n      styleOverrides: {\n        root: {\n          textTransform: 'none',\n          borderRadius: 8,\n        },\n      },\n    },\n  },\n});\n```\n\nWrap your app with `<ThemeProvider theme={theme}>` and use `useTheme()` hook to access values.",
    tags: ["css", "react", "webdev"],
  },
  {
    collection_id: 1,
    title: "Ideas for Blog Posts",
    content: "1. Why every developer should keep a Zettelkasten\n2. Migrating from Create React App to Vite\n3. The case for boring technology\n4. How I organize my notes (and why it matters)\n5. Understanding database indexes without the jargon",
    tags: ["ideas", "writing"],
  },
  {
    collection_id: 2,
    title: "JavaScript Event Loop Explained",
    content: "# The Event Loop\n\n## Execution Order\n\n1. **Call stack** — synchronous code runs first\n2. **Microtask queue** — `Promise.then`, `queueMicrotask`, `MutationObserver`\n3. **Macrotask queue** — `setTimeout`, `setInterval`, I/O, UI rendering\n\n## Key Rule\n\n> All microtasks are processed **before** the next macrotask.\n\n## Example\n\n```js\nconsole.log('1');              // sync\n\nsetTimeout(() => {\n  console.log('2');            // macrotask\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('3');            // microtask\n});\n\nconsole.log('4');              // sync\n\n// Output: 1, 4, 3, 2\n```\n\nThis is why `setTimeout(fn, 0)` doesn't mean \"run immediately\" — it means \"run after the current call stack and all microtasks are done.\"",
    tags: ["javascript", "webdev"],
  },
  {
    collection_id: 2,
    title: "Apartment Maintenance Log",
    content: "| Date | Issue | Status |\n|---|---|---|\n| 2025-10-01 | Leaky kitchen faucet | Fixed 10/5 |\n| 2025-11-15 | Heater not working | Fixed 11/18 |\n| 2026-01-20 | Bathroom tile cracked | Waiting on landlord |\n| 2026-02-28 | Smoke detector beeping | Replaced battery |",
    tags: [],
  },
  {
    collection_id: 1,
    title: "Functional Programming Concepts",
    content: "\n# FP Core Concepts\n\n## Pure Functions\n\nA function is **pure** if:\n- Same input always gives same output\n- No side effects\n\n```js\n// Pure\nconst add = (a, b) => a + b;\n\n// Impure\nlet count = 0;\nconst increment = () => ++count;\n```\n\n## Immutability\n\nNever mutate data. Create new copies instead.\n\n```js\n// Bad\narr.push(item);\n\n// Good\nconst newArr = [...arr, item];\n```\n\n## Higher-Order Functions\n\nFunctions that take or return other functions: `map`, `filter`, `reduce`.\n\n## Composition\n\n```js\nconst compose = (f, g) => (x) => f(g(x));\nconst toUpper = (s) => s.toUpperCase();\nconst exclaim = (s) => s + '!';\nconst shout = compose(exclaim, toUpper);\nshout('hello'); // 'HELLO!'\n```",
    tags: ["javascript", "learning", "programming"],
  },
  {
    collection_id: 2,
    title: "2026 Goals",
    content: "\n## Professional\n\n- [ ] Ship the Astronote MVP\n- [ ] Learn Rust basics\n- [ ] Give a talk at a local meetup\n- [ ] Read 12 technical books\n\n## Personal\n\n- [ ] Run a half marathon\n- [ ] Meditate daily for 6 months straight\n- [ ] Visit Japan\n- [ ] Learn to cook 10 new recipes\n\n## Financial\n\n- [ ] Max out retirement contributions\n- [ ] Build 6-month emergency fund\n- [ ] Start investing in index funds",
    tags: ["goals", "personal"],
  },
  {
    collection_id: 1,
    title: "Keyboard Shortcuts I Always Forget",
    content: "### VS Code\n\n- `Cmd+Shift+P` — Command palette\n- `Cmd+P` — Quick open file\n- `Cmd+D` — Select next occurrence\n- `Opt+Shift+F` — Format document\n- `Cmd+Shift+L` — Select all occurrences\n\n### macOS\n\n- `Cmd+Opt+Esc` — Force quit\n- `Cmd+Shift+.` — Show hidden files in Finder\n- `Ctrl+Cmd+Space` — Emoji picker",
    tags: ["devtools", "reference"],
  },
  {
    collection_id: 1,
    title: "Color Palette for Astronote",
    content: "# Astronote Color System\n\n## Primary\n\n- **Background:** `#1a1a2e` (deep navy)\n- **Surface:** `#16213e` (dark blue)\n- **Primary accent:** `#0f3460` (medium blue)\n- **Secondary accent:** `#e94560` (coral red)\n\n## Text\n\n- **Primary text:** `#eaeaea`\n- **Secondary text:** `#a0a0b0`\n- **Muted:** `#6c6c80`\n\n## Semantic\n\n- **Success:** `#4caf50`\n- **Warning:** `#ff9800`\n- **Error:** `#f44336`\n\n---\n\n*Inspired by the night sky theme. Should feel calm and focused.*",
    tags: ["astronote", "design"],
  },
  {
    collection_id: 2,
    title: "Learning Rust — Day 1",
    content: "# Rust: First Impressions\n\n## What I Learned\n\n- Variables are **immutable by default** (use `mut` for mutability)\n- No null — uses `Option<T>` instead\n- **Ownership** system replaces garbage collection\n- Pattern matching with `match` is powerful\n\n```rust\nfn main() {\n    let name = String::from(\"world\");\n    greet(&name); // borrowing\n    println!(\"Still have: {}\", name);\n}\n\nfn greet(name: &str) {\n    println!(\"Hello, {}!\", name);\n}\n```\n\n## Ownership Rules\n\n1. Each value has exactly **one owner**\n2. When the owner goes out of scope, the value is **dropped**\n3. You can **borrow** references (`&T`) without taking ownership\n\nThis is going to take some getting used to, but I can already see how it prevents entire categories of bugs.",
    tags: ["learning", "programming", "rust"],
  },
  {
    collection_id: 2,
    title: "Sourdough Starter Schedule",
    content: "**Daily feeding (room temp):**\n\n1. Discard all but 50g of starter\n2. Add 50g whole wheat flour\n3. Add 50g water (room temp)\n4. Mix well\n5. Cover loosely, wait 12-24 hours\n\nStarter should double in size within 4-6 hours when ready to bake.\n\n*If storing in fridge, feed once per week.*",
    tags: ["cooking", "recipe"],
  },
  {
    collection_id: 1,
    title: "Debugging React Performance",
    content: "# React Performance Debugging\n\n## Step 1: Identify the Problem\n\nUse **React DevTools Profiler** to find components that re-render too often.\n\n## Step 2: Common Fixes\n\n### Memoize expensive computations\n\n```tsx\nconst sortedItems = useMemo(\n  () => items.sort((a, b) => a.name.localeCompare(b.name)),\n  [items]\n);\n```\n\n### Prevent unnecessary re-renders\n\n```tsx\nconst MemoizedChild = React.memo(({ data }) => {\n  return <ExpensiveComponent data={data} />;\n});\n```\n\n### Stabilize callbacks\n\n```tsx\nconst handleClick = useCallback(() => {\n  doSomething(id);\n}, [id]);\n```\n\n## Step 3: Check for Anti-patterns\n\n- Creating objects/arrays inline in JSX props\n- Using index as key in dynamic lists\n- Putting too much in a single context provider\n\n> **Remember:** Don't optimize prematurely. Measure first, then optimize the actual bottleneck.",
    tags: ["performance", "react", "webdev"],
  },
  {
    collection_id: 2,
    title: "Favorite Quotes",
    content: "> \"We are what we repeatedly do. Excellence, then, is not an act, but a habit.\" — *Will Durant*\n\n> \"The best time to plant a tree was 20 years ago. The second best time is now.\" — *Chinese proverb*\n\n> \"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.\" — *Antoine de Saint-Exupéry*\n\n> \"The map is not the territory.\" — *Alfred Korzybski*\n\n> \"Strong opinions, weakly held.\" — *Paul Saffo*",
    tags: [],
  },
];

const FOUR_MONTHS_MS = 4 * 30 * 24 * 60 * 60 * 1000;

function randomTimestamp(startMs: number, endMs: number): string {
  const ms = startMs + Math.random() * (endMs - startMs);
  return new Date(ms).toISOString();
}

function generateTimestamps(): { createdAt: string; updatedAt: string } {
  const now = Date.now();
  const fourMonthsAgo = now - FOUR_MONTHS_MS;
  const createdAt = randomTimestamp(fourMonthsAgo, now);
  const createdMs = new Date(createdAt).getTime();
  // 50% chance updatedAt === createdAt, otherwise a later time
  const updatedAt = Math.random() < 0.5
    ? createdAt
    : randomTimestamp(createdMs, now);
  return { createdAt, updatedAt };
}

export async function seed(knex: Knex): Promise<void> {
  const existingCount = await knex("notes").where("archived", 0).count("* as count").first();
  if (existingCount && Number(existingCount.count) > 0) return;

  for (const collection of collections) {
    await knex("collections").insert({
      name: collection.name,
      isDefault: collection.name === "Personal" ? 1 : 0,
    });
  }

  for (const note of seedNotes) {
    const id = uuidv4();
    const { createdAt, updatedAt } = generateTimestamps();

    await knex("notes").insert({
      id,
      title: note.title,
      content: note.content,
      collectionId: note.collection_id,
      createdAt,
      updatedAt,
    });

    for (const tag of note.tags) {
      const normalizedTag = tag.toLowerCase();
      await knex("note_tags").insert({ noteId: id, tag: normalizedTag });
      await knex.raw(
        "INSERT INTO tags (tag, count) VALUES (?, 1) ON CONFLICT(tag) DO UPDATE SET count = count + 1",
        [normalizedTag],
      );
    }
  }

  console.log(`Seeded database with ${seedNotes.length} notes`);
}
