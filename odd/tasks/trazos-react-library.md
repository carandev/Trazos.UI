# Trazos.UI React library

Objective: turn Trazos.UI into a monorepo that ships the Blazor/Razor library (NuGet) and a new React + TypeScript library (npm) from one shared design-token source.
Branch: `feat/react-library` (worktree `/home/carandev/Work/Trazos.UI-worktrees/react-library`). Delivery: work-unit commits on the feature branch; push/PR/publish only with explicit user approval; PR slicing decided at PR time. Test runner: Vitest + React Testing Library (JS), `dotnet build` (Razor).

## Specs

- **S1 Monorepo layout.** "Keep `src/Trazos.UI` (and its NuGet publish) working exactly as today; do not break its public API or its published package contents. Add JS workspaces (npm workspaces unless you find a strong reason otherwise; check what the user's other TS repos use)". Evidence: `carandev.me` uses npm (`package-lock.json`) → npm workspaces.
- **S2 Tokens package.** "`packages/tokens`: the single source of truth for design tokens (colors incl. dark-mode role tokens, typography, radii/sketch borders, spacing, shadows) as plain CSS custom properties, publishable to npm. Extract them from `trazos.css` without changing any rendered value."
- **S3 React package.** "`packages/react`: the React component library, publishable to npm."
- **S4 Razor consumes tokens.** "Make the Razor library consume the tokens from `packages/tokens` (for example by copying/including them at build time) so there is no duplicated token definition. Verify the Razor library still builds and its `wwwroot` output is equivalent."
- **S5 Quality bar.** "React 19, TypeScript `strict` (no `any`, no non-null assertions without justification), ESM output with `.d.ts` types, tree-shakeable, CSS shipped alongside (no runtime CSS-in-JS). Props must be well-typed: variants as string-literal unions mirroring the Razor `*Variant` enums; forward refs/native attributes where it makes sense; accessible markup (roles, labels, keyboard support for Dialog/Modal/Drawer/Tabs/Autocomplete/Toast)."
- **S6 Component parity.** "port every component in `src/Trazos.UI/Components/` (Autocomplete, Badge, Button, Calendar, Card, Dialog, Drawer, EmptyState, FormSection, IconBox, Input set, Modal, RadioCard, Skeleton, Spinner, Table, Tabs, Toast, WhatsApp) plus the Layout pieces and services that have a React equivalent (e.g. toast/confirm-dialog services become providers + hooks). Same visual output and same behavior as the Razor versions; read each Razor component (.razor, .razor.cs, .razor.css) before porting it."
- **S7 Tests.** "Vitest + React Testing Library for behavior and accessibility of every component, through the public API. Follow test-first where a deterministic test exists."
- **S8 Docs/playground.** "provide a way to see and try the React components (extend the existing docs if reasonable, or a small Vite playground / Storybook — propose the choice briefly before building it). Update READMEs (root + each package) with install and usage."
- **S9 CI/CD.** "add a GitHub Actions workflow that builds, type-checks, lints, and tests the JS packages on PRs, and publishes `packages/tokens` and `packages/react` to npm on release, mirroring how the NuGet workflow is triggered. Keep the existing NuGet workflow working. Pin action versions."
- **S10 User decisions.** Ask ONE at a time when it matters: npm package names/scope (suggested `@carandev/trazos-tokens`, `@carandev/trazos-ui`) and npm publish credentials; docs/playground choice.
- **S11 Working rules.** Work-unit Conventional Commits, no AI attribution / no Co-Authored-By. "Do not push, open a PR, publish to npm, or merge without the user's explicit approval." "Run the Razor build, the JS build, type-check, lint, and tests before reporting a task done, and report real results including failures."

## Tasks

| ID | Specs | Task | Route | Status | Commit |
|----|-------|------|-------|--------|--------|
| T1 | S1, S2, S4 | npm workspaces root + `packages/tokens` + Razor build consumes tokens; wwwroot equivalence check | inline | pending | |
| T2 | S3, S5, S7 | `packages/react` scaffold (Vite lib build, tsc types, ESLint, Vitest) + Button, Badge | inline | pending | |
| T3 | S6, S7 | Display: Card, IconBox, EmptyState, FormSection, Skeleton, LoadingSpinner, WhatsAppButton | tbd | pending | |
| T4 | S6, S7 | Inputs: TextInput, TextArea, SelectInput, Checkbox, RadioCardGroup | tbd | pending | |
| T5 | S6, S7 | Overlays/services: Modal, Drawer, ConfirmDialog provider+hook, Toast provider+hook | tbd | pending | |
| T6 | S6, S7 | Data/nav: Tabs, DataTable, Autocomplete, MonthCalendar | tbd | pending | |
| T7 | S6, S7 | Layout: AppShell | tbd | pending | |
| T8 | S8 | Docs/playground (choice confirmed with user) | tbd | pending | |
| T9 | S9 | JS CI + npm publish workflow; NuGet workflow path filter includes tokens | inline | pending | |
| T10 | S8 | READMEs root + packages | inline | pending | |

## Log

- L1 (2026-11-04) Original request: see the Specs section; quoted verbatim from the user's task brief (goal: "add a React + TypeScript version of Trazos.UI to this repository, turning it into a monorepo that ships both the existing Blazor/Razor library (NuGet) and a new React library (npm) from ONE shared design-token source").
- L2 (2026-11-04) Decision: npm workspaces (matches `carandev.me`). Node v26.12.0, npm 11.20.0, .NET 10.0.403 available locally.
- L3 (2026-11-04) Plan: tokens move out of `wwwroot/trazos.css` into `packages/tokens`; `trazos.css` is assembled at build time from tokens + Razor base utilities; NuGet workflow path filter must add `packages/tokens/**`.
