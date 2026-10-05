# Swim Log

A web app for building, logging and analysing swim sessions.

This is Phase 1 of the plan, the **session logger**:

- Build a session from sets with reps, distance, stroke, send-off, energy system and a note.
- Quick-add sets by typing shorthand like `4x100 free @1:45 AT` and pressing Enter.
- See total distance, time on send-offs and the energy-system split as you go.
- Save sessions, browse history grouped by month, and **Repeat** a past session onto today.

Sessions are stored in the browser (localStorage) for now. Storage sits behind a small
`SessionStore` interface in `src/lib/storage.ts`, so Supabase can replace it later.

## Look and feel

The UI uses the Case Register design system from Claude Design: the token and component CSS
lives in `src/styles/design-system/` (copied as-is), and `src/index.css` adds the swim-specific
pieces using those tokens. Light and dark themes follow the system setting and can be toggled
from the header; the choice is remembered in the browser.

## Quick-add shorthand

`[reps x]distance` first, then in any order:

| Part | Examples |
| --- | --- |
| Stroke | `free` `back` `breast` `fly` `IM` `kick` `pull` `drill` `choice` (also `fr`, `bk`, `br`, `fl`, `ch`) |
| Send-off | `@1:45`, `@ 1:45`, `@55` |
| Energy system | `REC` `A1` `A2` `AT` `VO2` `LT` `SP` |

Anything else becomes the set's note. Stroke defaults to free; energy defaults to the
"Default energy" picker.

## Development

```sh
npm install
npm run dev     # local dev server
npm test        # unit tests (Vitest)
npm run lint
npm run build   # production build into dist/, ready for Vercel
```
