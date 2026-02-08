# Specification

## Summary
**Goal:** Build a Dead by Daylight companion app with a multi-page UI, Internet Identity sign-in, an internal/placeholder content dataset, and per-user saved data (builds, match history, favorites).

**Planned changes:**
- Create a navigable multi-section UI with separate pages: Characters, Perks, Build Planner, Match Tracker, News, Wiki, plus a Profile area.
- Add Internet Identity authentication (sign in/out) and reflect authenticated state in the UI.
- Implement a single Motoko backend actor that:
  - Serves internal/placeholder datasets for Characters, Perks, News, and Wiki via query methods.
  - Stores per-user data keyed by principal for saved builds, match history, and favorites, with CRUD canister methods and auth checks.
- Build Characters & Perks sections with list + detail views, search/filter/sort controls, and favorite/unfavorite for signed-in users (persisted).
- Build Planner: signed-in users can create/edit/delete/save builds and browse their saved builds; unauthenticated users can view UI but must sign in to save.
- Match Tracker: signed-in users can add/delete match entries (date/time, role, result, optional notes) and view their history; unauthenticated users are prompted to sign in.
- News and Wiki: list + detail views backed by the internal dataset with basic search and empty/loading/error states.
- Apply a consistent dark/horror-inspired theme across pages (avoid blue/purple as primary colors) and include generated static logo + subtle background as frontend assets.

**User-visible outcome:** Users can browse characters, perks, news, and wiki; sign in with Internet Identity to favorite characters/perks, create and manage build plans, record matches, and see a profile summary of their saved items and recent activity.
