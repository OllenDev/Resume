# Agents

## Deployment notes

- This is a static Vite site. Deploy the built `dist/` output (not the source files) to GitHub Pages.
- GitHub Pages will 404 on `/src/main.tsx` if you publish the repo root, and browsers cannot run `.tsx` sources anyway.
- Easiest path: set Pages to use the `/docs` folder on the default branch, then run `npm run build:pages` to refresh `docs/`.
- `import.meta.env` values (like `VITE_GA_ID`) are injected at build time; they will be undefined when serving raw source files.
- For branch-based Pages, GitHub Pages serves whatever is committed in `/docs`. Run `npm run build:pages` before committing so the built `docs/` output (including `.nojekyll`) is checked in and served by Pages.
- For agent notes: put technical requirements here first; only update `README.md` when explicitly requested.

## Vite static deployment summary (from docs)

- Vite builds to `dist/` by default via `npm run build`; deploy the `dist/` folder to your host.
- `npm run preview` serves the production build locally; it is for local verification, not production.
- For GitHub Pages, set `base` in `vite.config.ts`:
  - Use `/` for user/organization pages or custom domains.
  - Use `/<REPO>/` for project pages (e.g., `https://<USER>.github.io/<REPO>/`).
- GitHub Pages requires a build step; the docs recommend a GitHub Actions workflow that builds and uploads `dist/` on pushes to the default branch.

## GitHub Pages notes (from GitHub docs)

- You can publish from a branch/folder (e.g., `/docs` on `main`) or from a GitHub Actions workflow that deploys a build artifact.
- The publishing source must contain an entry file at its root (`index.html`, `index.md`, or `README.md`).
- GitHub Pages sites are always publicly accessible once published, even if the repo is private (plan permitting).
- If you publish from a branch, GitHub Pages runs Jekyll by default; for non-Jekyll builds, add a `.nojekyll` file at the publishing root or use an Actions workflow to build and deploy.
- Pages does not support server-side languages; only static assets are served.

## Troubleshooting

### npm warning about `http-proxy`

If you see a warning like `Unknown env config "http-proxy"` when running npm commands, it means your
shell environment is exporting `http-proxy`/`https-proxy` (with a hyphen). npm expects `HTTP_PROXY`,
`HTTPS_PROXY`, or the `NPM_CONFIG_HTTP_PROXY`/`NPM_CONFIG_HTTPS_PROXY` variables instead. Update
your shell environment to use the supported variable names or unset the `http-proxy`/`https-proxy`
variables to silence the warning.

## Plan to align config with Vite GitHub Pages guidance

1. Confirm which Pages URL we deploy to (user/org root vs repo subpath).
2. Update `vite.config.ts` `base` to match:
   - `/` for root/custom domain, or `/<REPO>/` for project pages.
3. Prefer GitHub Actions deployment instead of `/docs` output:
   - Add `.github/workflows/deploy.yml` that runs `npm ci`, `npm run build`, and deploys `dist/`.
4. If we adopt the Actions workflow, remove or de-emphasize the `/docs`-based `build:pages` path in favor of `dist/` uploads.
5. Ensure the published output contains a root `index.html` and, if publishing from a branch, add `.nojekyll` to the output root to bypass Jekyll.
