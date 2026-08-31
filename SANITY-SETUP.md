# Sanity setup — I AM Church

The Studio is a separate application in its own folder and its own git repo:

```
~/I AM Church/
├── I AM/                          # this repo — the website
└── studio-i-am-church-website/    # the Studio
```

Project `xhz48loo`, dataset `production`.

## Remaining one-time steps

Run these from the Studio folder, on your Mac:

```bash
cd "~/I AM Church/studio-i-am-church-website"

npx sanity login             # browser sign-in
npx sanity schemas deploy    # uploads the schema to the Content Lake
npx sanity dataset import seed.ndjson production
npx sanity deploy            # hostname: iamchurchaz
```

Then in [sanity.io/manage](https://sanity.io/manage) → project → **API** →
**CORS origins**, add the live site URL. Leave "Allow credentials" **off** —
the site only reads published content. Without this the browser blocks the
request and every page silently falls back to its built-in HTML.

Finally, **Members** → invite the pastor as an **Editor**. The free plan
covers the owner plus two editors.

His login is then **https://iamchurchaz.sanity.studio** — see `PASTOR-GUIDE.md`.

## The seed content

`seed.ndjson` holds the six events and five groups that used to be hardcoded
in the HTML, plus the current service times. **The six events are all in the
past** (June–July 2026), so they will import and then not appear on the site.
They are there as examples of the shape — delete them once real ones exist.

## How the website reads it

`sanity-content.js` runs on every page, fetches everything in one request, and
renders into elements marked `data-sanity="..."`.

- Sanity unreachable → each page keeps the HTML already in it. A network
  problem shows stale content, never an empty page.
- Sanity responds with nothing for a section → that section empties out, so a
  deleted event really does disappear.
- Past events are filtered in the browser; the events page prunes itself.

## Gotchas

- **Do not find-and-replace the project id in `sanity-content.js`.** The guard
  that keeps the file inert compares against the literal string
  `REPLACE_WITH_PROJECT_ID`. Rewriting that comparison silently disables the
  whole module and the site quietly reverts to its built-in content.
- **Group category values are load-bearing.** `connections`, `ya`, `kids`,
  `men`, `women` are what the filter buttons in `groups.html` look for.
  Renaming one in the Studio breaks that filter.
- The homepage "Groups" strip is still hardcoded. Its scroll animation is tied
  to that markup, so it was left alone deliberately. `groups.html` is the
  Sanity-driven page.
- `sermons.html` and `gallery.html` are new pages, linked from the footer
  rather than the main nav to avoid crowding it.
- Free plan ceilings: 500k API requests/month, 20GB of images.
