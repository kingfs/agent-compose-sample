# Repository Documentation and GitHub Pages

[中文](README.md)

This directory documents repository development and site publishing. Runtime instructions for each sample stay in `agents/*/README.en.md`; story-driven articles live in `docs/*/index.en.md`.

## GitHub Pages content

Pushing any tag, or manually running `Publish agent documentation` in GitHub Actions, builds and deploys Pages.

- `/`: Chinese sample index.
- `/en/`: English sample index.
- `/agents/{name}/`: Chinese technical README.
- `/en/agents/{name}/`: English technical README.
- `/stories/`: Chinese “Agent at Work” story index.
- `/en/stories/`: English story index.
- `/stories/{name}/` and `/en/stories/{name}/`: localized stories.

Story articles use local illustrations from `docs/assets/*.svg`. The builder copies them to `stories/assets/` and applies Jekyll's `relative_url` filter so a project site's repository `baseurl` is preserved. The site does not depend on an external image host or CDN.

## Local build

```bash
node scripts/build-pages.mjs --output .pages-src
```

The output is Jekyll input for preview and should not be committed.

## Changes and validation

Keep both Chinese and English READMEs in every sample. Run the project validator and `agent-compose config --quiet` for each changed sample, then rebuild Pages and run `git diff --check` after documentation changes.
