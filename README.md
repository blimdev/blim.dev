# blim.dev

A tiny, zero-build static site — "More Apps by blim.dev" — that lists the apps and games
built under the `blim.dev` umbrella. No framework, no bundler, no `npm`. It's just HTML, CSS,
JavaScript, and two JSON data files that are fetched and rendered in the browser.

## File layout

| file | purpose |
|---|---|
| `index.html` | Document shell and markup skeleton. |
| `styles.css` | All styling. |
| `app.js` | Fetches the JSON, builds the cards, handles filters and the phone rail. |
| `site.json` | Site chrome: logo, tagline, footer text and links. |
| `apps.json` | The list of app cards (see schema below). |
| `previews/` | Card screenshot images (`*.png`). |

## Running locally

The page fetches `site.json` and `apps.json`, so opening `index.html` directly via
`file://` will **not** work — the fetches are blocked. Serve the folder over HTTP:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

(or `npx serve` if you prefer Node.)

## Adding an app

Add a new object to the **end** of the array in `apps.json`. The list is rendered
newest-first (reversed), so the last entry in the file appears first on the page.

```json
{
  "title": "My App",
  "description": "One-line description.",
  "year": "2026",
  "theme": "blue",
  "display": "phone",
  "image": "./previews/myapp.png",
  "icon": "🎮",
  "tags": ["Tools"],
  "badges": ["react"],
  "url": "https://myapp.blim.dev/"
}
```

### Schema

| field | type | notes |
|---|---|---|
| `title` | string | Required. |
| `description` | string | Required, one line. |
| `year` | string | e.g. `"2026"`. Omit if `wip` is set. |
| `wip` | boolean | Optional. Hides the card unless WIP mode is toggled on; card shows a "WIP" pill. |
| `theme` | string | Card background colour: one of `teal` `yellow` `purple` `red` `blue` `green`. |
| `display` | string | `"phone"` (portrait rail) or `"desktop"` (grid). Defaults to `desktop`. |
| `image` | string | `./previews/<name>.png`. Phone cards look best with a portrait (~9:19) screenshot. |
| `icon` | string | Emoji shown when there is no image (or the image fails to load). |
| `tags` | string[] | Drives the filter chips. `Tools` and `Games` are sorted first. |
| `badges` | string[] | Small lowercase tech pills, e.g. `["react", "phaser"]`. |
| `url` | string | `https://` link. Without a `url` the card is not clickable. |

Add the preview image to `previews/` and keep it reasonably small (the existing images are
under ~370 KB each).

## WIP mode (easter egg)

Work-in-progress apps (`"wip": true`) are hidden by default. To reveal them, **triple-click
the "." in the "blim.dev" title** within 600 ms. Triple-click again to hide them.

## Deployment

The site is hosted on **Vercel** and served straight from the repo root (no build step —
Framework Preset "Other"). Pushing to `main` triggers an automatic production deploy at
<https://blim.dev>. To deploy manually from the repo root: `npx vercel --prod`.
