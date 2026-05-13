# Release Process

This repo releases Codex plugin versions from Git tags. Codex reads the
plugin version from `.codex-plugin/plugin.json` and caches installed
plugins by version, so every public release must bump that manifest.

## Release Checklist

1. Start clean and current:

   ```bash
   git checkout main
   git pull --rebase origin main
   git status --short
   ```

2. Pick the next semver (`patch`, `minor`, or `major`) and update all
   version files:

   ```bash
   npm run version:set -- 0.1.1
   ```

   This updates:

   - `package.json`
   - `package-lock.json`
   - `.codex-plugin/plugin.json`

3. Update release notes:

   - Add a section to `RELEASE_NOTES.md` named `## v0.1.1`.
   - Add a matching section to `CHANGELOG.md` named `## [0.1.1] - YYYY-MM-DD`.
   - Optionally add `docs/WHATS_NEW_v0.1.1.md` for focused release copy.

   The release workflow uses the first available source in this order:

   1. `docs/WHATS_NEW_vX.Y.Z.md`
   2. `RELEASE_NOTES.md`
   3. `CHANGELOG.md`

4. Validate locally:

   ```bash
   npm run build
   npm run release:check -- v0.1.1
   npm run release:notes -- v0.1.1
   ```

5. Commit the release bump:

   ```bash
   git add package.json package-lock.json .codex-plugin/plugin.json CHANGELOG.md RELEASE_NOTES.md docs/WHATS_NEW_v0.1.1.md
   git commit -m "Release v0.1.1"
   ```

   If you did not create `docs/WHATS_NEW_v0.1.1.md`, omit that path.

6. Tag and push:

   ```bash
   git tag v0.1.1
   git push origin main --tags
   ```

7. Watch GitHub Actions:

   - `CI` should pass on `main`.
   - `Plugin Scanner` should pass the AI plugin quality gate.
   - `Release` should run from the tag, compile `release_notes.md`, and
     create the GitHub Release body from the notes. The release workflow
     also runs the scanner gate before publishing the release.

8. Smoke-test install:

   ```bash
   codex plugin marketplace add frumu-ai/tandem-codex-plugin@v0.1.1
   ```

## Notes

- Do not create a tag that differs from `.codex-plugin/plugin.json`.
  `npm run release:check -- vX.Y.Z` will fail if they diverge.
- For normal development installs, users can stay on `main`.
- For stable/reproducible installs, point Codex at a release tag.
