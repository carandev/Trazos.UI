# Trazos UI

A warm, hand-drawn design system ("Cuaderno" style): parchment surfaces, ink text, organic sketch borders and accessible primitives.
It ships for two stacks from one set of design tokens.

| Package | Registry | Folder | For |
|---------|----------|--------|-----|
| `Trazos.UI` | NuGet | [`src/Trazos.UI`](src/Trazos.UI/README.md) | Blazor / Razor apps |
| `@carandev/trazos-ui` | npm | [`packages/react`](packages/react/README.md) | React 19 apps |
| Tokens (internal) | — | [`packages/tokens`](packages/tokens/README.md) | Shared by both; on npm as `@carandev/trazos-ui/tokens.css` |

## One token source

`packages/tokens/tokens.css` is the only place where a design token is defined (colors with their dark-mode roles, typography, sketch radii and shadows). `packages/tokens/utilities.css` holds the shared utility classes.

- The **React** build bundles both files, unchanged, at the top of `dist/styles.css`, and ships `tokens.css` alone as `dist/tokens.css`.
- The **Razor** build concatenates both files into `src/Trazos.UI/wwwroot/trazos.css` (generated at build time and git-ignored), so the NuGet package keeps serving `_content/Trazos.UI/trazos.css` exactly as before.

Change a token once, and both libraries pick it up.

## Repository layout

```text
packages/tokens      CSS custom properties + shared utilities (private workspace)
packages/react       React component library (npm)
apps/playground      Vite app to try the React components
src/Trazos.UI        Razor Class Library (NuGet)
docs/Trazos.UI.Docs  Blazor documentation site
```

## Develop

Requirements: Node.js 20.19+ (CI uses 24), npm 10+, .NET 10 SDK.

```bash
npm install                 # all JS workspaces
npm run dev -w @carandev/trazos-playground   # playground at http://localhost:5173

npm run lint                # ESLint, every workspace
npm run typecheck           # tsc, every workspace
npm test                    # tokens tests + Vitest
npm run build               # tokens (no build) + React dist + playground

dotnet build src/Trazos.UI/Trazos.UI.csproj              # Razor library
dotnet run --project docs/Trazos.UI.Docs                 # Blazor docs site
```

## Release

| Workflow | Runs on | Publishes |
|----------|---------|-----------|
| `publish-trazos-nuget.yml` | push to `main` (Razor or token changes), `v*` tags, manual | `Trazos.UI` to NuGet (`NUGET_API_KEY` secret) |
| `js-packages.yml` | pull requests: lint, type-check, test, build, Razor build | — |
| `js-packages.yml` | push to `main`, `v*` tags, manual | `@carandev/trazos-ui` to npm |

npm publishing uses [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC, no stored token, automatic provenance). A version already on npm is skipped, so bump `version` in `packages/react/package.json` to release. Setup, once, on npmjs.com: *Settings → Trusted publisher → GitHub Actions*, organization `carandev`, repository `Trazos.UI`, workflow `js-packages.yml`. If the package does not exist on npm yet, publish its first version manually (`npm run build && npm publish -w @carandev/trazos-ui`), then add the trusted publisher.

## License

MIT
