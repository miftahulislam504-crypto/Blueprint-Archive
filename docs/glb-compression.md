# GLB Compression — how to actually shrink `public/models/*.glb`

## Why this is a doc, not a code change

Real geometry/texture compression (Draco or Meshopt) happens by running a
CLI tool (`gltf-transform`) over each `.glb` file and writing out a
smaller one. That's a build-time transformation, not something
`Environment`, `useGLTF`, or any other runtime React/Three.js code can do
— there's no "compress this on page load" option, and doing it in the
browser on every visitor's device would cost far more than it saves.

This project is edited entirely from a phone via GitHub's browser editor,
with Vercel handling deploys — there's no local `npm install` / CLI step
available to run `gltf-transform` directly. The practical way to still
get this done is a GitHub Action that runs it for you, in the cloud,
triggered by a commit.

## Current sizes (from this pass)

| File | Size |
|---|---|
| `avatar-adventurer.glb` | ~1.9 MB |
| `energy-tower.glb` | ~188 KB |
| `ruins-temple.glb` | ~27 KB |
| `crystal-core.glb` | ~32 KB |
| `crystal-spike-alt.glb` | ~10 KB |

The avatar is the only one worth spending effort on — the other four are
already small enough that compression isn't worth the added complexity
(Draco/Meshopt decoding also costs a small amount of CPU time on load —
not worth paying for files this size).

**Important, specific to this file:** the avatar has 24 baked keyframe
animation clips (per project notes) on a skinned mesh, not morph
targets — that distinction matters for which compressor to use. Draco
(`KHR_draco_mesh_compression`) only compresses static vertex geometry; it
does nothing for animation/keyframe data, and actively breaks morph
targets if a model has any (this one doesn't, so that specific risk
doesn't apply here). **Meshopt compresses geometry, morph targets, AND
keyframe animation together** — for an animation-heavy file like this
one, Meshopt is the better default, not Draco. The workflow below uses
`--compress meshopt` for exactly this reason; swap to `draco` only for a
future model that's geometry-heavy with little/no animation.

## One-time setup: add the workflow file

Create `.github/workflows/compress-models.yml` in the repo (via GitHub's
web UI — "Add file" → "Create new file" works fine from a phone browser)
with this content:

```yaml
name: Compress GLB models

on:
  workflow_dispatch:
    inputs:
      file:
        description: 'Path to the .glb file to compress, relative to repo root'
        required: true
        default: 'public/models/avatar-adventurer.glb'

jobs:
  compress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install gltf-transform
        run: npm install -g @gltf-transform/cli

      - name: Compress
        run: |
          gltf-transform optimize "${{ inputs.file }}" "${{ inputs.file }}.compressed.glb" \
            --compress meshopt \
            --texture-compress webp

      - name: Show size comparison
        run: |
          echo "Before:"
          ls -lh "${{ inputs.file }}"
          echo "After:"
          ls -lh "${{ inputs.file }}.compressed.glb"

      - name: Commit compressed file
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          mv "${{ inputs.file }}.compressed.glb" "${{ inputs.file }}"
          git add "${{ inputs.file }}"
          git commit -m "Compress ${{ inputs.file }} via gltf-transform" || echo "No changes"
          git push
```

For a future *non-animated* model, change `--compress meshopt` to
`--compress draco` in the step above — Draco generally compresses static
geometry slightly better than Meshopt when there's no animation data to
worry about losing.

## Running it

1. On GitHub, go to the repo's **Actions** tab.
2. Pick **"Compress GLB models"** in the left sidebar.
3. Click **"Run workflow"**, confirm the file path is
   `public/models/avatar-adventurer.glb`, run it.
4. Check the job's log for the before/after size line — confirm it
   actually shrank before trusting the commit it pushes.
5. Vercel will auto-deploy the new commit like any other push.

## One important follow-up: decoder support (good news — mostly automatic)

drei's `useGLTF` already handles Meshopt decoding **automatically, with
no setup needed** — its third argument, `useMeshOpt`, defaults to `true`.
So if the avatar gets compressed with `--compress meshopt` as recommended
above, `PlayerAvatar.tsx`'s existing `useGLTF(MODEL_PATH)` call needs
**no changes at all** to keep working.

If a future file instead gets compressed with Draco (see the note above
about switching flags for non-animated models), that also works with no
code changes — `useDraco` is drei's *first* optional argument and also
defaults to `true`. Draco decoding does fetch its decoder from a CDN
(`gstatic.com`) by default though — same CDN-dependency tradeoff
`EnvironmentLighting.tsx` already documents for `preset`-based HDRIs. If
that's ever a concern, a local decoder path can be passed instead:
`useGLTF(path, '/draco/')`.

## Textures

None of the current 5 GLBs carry large embedded textures worth
compressing further right now (checked during this pass) — this section
is here for when a future model does. The `--texture-compress webp` flag
in the workflow above already handles that case automatically if/when it
comes up.
