# I AM Church — content setup

One-time setup, done once by whoever owns the site. After this, the pastor
never touches any of it.

## 1. Create the Sanity project

```bash
cd studio
npx sanity login          # opens a browser — sign in with Google
npx sanity init --project-plan free
```

Choose **Create new project**, name it `I AM Church`, and use the default
dataset name `production`.

Copy the **project ID** it prints (8 characters, like `a1b2c3d4`).

## 2. Put the project ID in three places

```bash
cd ..
# from the repo root
sed -i '' "s/REPLACE_WITH_PROJECT_ID/YOUR_ID_HERE/" sanity-content.js
sed -i '' "s/REPLACE_WITH_PROJECT_ID/YOUR_ID_HERE/" studio/sanity.config.js
sed -i '' "s/REPLACE_WITH_PROJECT_ID/YOUR_ID_HERE/" studio/sanity.cli.js
```

Until this is done, `sanity-content.js` deliberately does nothing and the
site shows its built-in content. That is the safe default.

## 3. Load the starting content

```bash
cd studio
npx sanity dataset import seed.ndjson production
```

This imports the six events and five groups that were hardcoded in the HTML,
plus the current service times, so the studio isn't empty on day one.
**The six events are all in the past** (June–July 2026) — they are there as
examples of the shape. Delete them once real ones are added.

## 4. Allow the website to read the content

In [sanity.io/manage](https://sanity.io/manage) → your project → **API** →
**CORS origins**, add your live site's URL (and `http://localhost:*` if you
preview locally). Leave "Allow credentials" **off** — the site only reads
public content.

## 5. Publish the studio

```bash
npx sanity deploy
```

Choose the hostname `iamchurch`. The pastor's login is then:

**https://iamchurch.sanity.studio**

## 6. Give the pastor access

sanity.io/manage → **Members** → invite his email as an **Editor**.
The free plan covers the owner plus two editors.

---

## How it works

- `sanity-content.js` runs on every page, fetches all content in one request,
  and renders it into elements marked `data-sanity="..."`.
- If Sanity is unreachable, each page keeps the HTML it already contains, so
  a network problem shows stale content rather than an empty page.
- If Sanity responds and has no content for a section, that section empties
  out — a deleted event really does disappear.
- Past events are filtered out in the browser, so the events page cleans
  itself up without anyone doing anything.

## Things to know

- The homepage "Groups" strip is still hardcoded. It has a scroll animation
  tied to its markup, so it was left alone deliberately; `groups.html` is the
  page driven by Sanity.
- `sermons.html` and `gallery.html` were created new — they did not exist
  before. They are linked from the footer, not the main nav, to avoid
  crowding it. Move them up if you want them more prominent.
- Free plan ceilings: 500k API requests/month, 20GB of images. A church site
  will not come close.
