# Acoustic Underground — concept site

Concept rebuild of [acousticundergroundrva.com](https://www.acousticundergroundrva.com) plus a logo review hub for the band.

## Live preview

This repository is designed to be served by **GitHub Pages**.

1. Push to `main` on [github.com/twinprice/AUWebsite](https://github.com/twinprice/AUWebsite).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
4. Pick branch `main` and folder `/ (root)`, then save.
5. After a minute or two, the site will be live at `https://twinprice.github.io/AUWebsite/`.

## Page map

| URL | Purpose |
| --- | --- |
| `index.html` | Landing hub. Two tiles: band site and logo review. |
| `band.html` | Band website concept (updated homepage). |
| `logos.html` | Logo review hub. Cards per round. |
| `logos-all.html` | All 24 concepts on one page with vote/comment buttons. |
| `AU_logo_concepts_round1.html` … `round5.html` | Original logo concept pages, unchanged. |

## Things you need to fill in

- **Google Form URLs for voting.** The logo voting page uses a placeholder URL `https://forms.gle/REPLACE_WITH_FORM_URL` for every vote button. Create a Google Form (or one per concept) and find-and-replace that string in `logos-all.html`.
- **Instagram feed embed.** The band site has an Instagram block with a dashed-outline placeholder where a third-party widget embed goes. Sign up for a free account at [LightWidget](https://lightwidget.com/) or [Elfsight](https://elfsight.com/instagram-feed-instashow/), point it at `@acousticundergroundrva`, then paste the generated snippet into the `<div class="ig-embed-slot">` in `band.html`.
- **Bandsintown widget.** The shows section has a placeholder where Bandsintown's embed script goes. Paste your widget snippet inside `<div class="bandsintown-placeholder">`.
- **Info sheet update.** `AcousticUndergroundInfoSheet.txt` lists the five musicians but doesn't mention Ashton Mellott (live sound), who is now on the band page. Consider adding him to the info sheet so press kits stay in sync.

## Local preview

No build step. Open `index.html` in a browser, or run a simple local server so iframes resolve correctly:

```bash
cd AUWebsite
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Assets

- `Photos/BandGroupPicture.jpeg` — used in the band-site hero.
- `Photos/BandMemberHeadshots/*.avif` — member portraits.
- `Photos/LivePictures/` and `Photos/RecordingStudio/` — available for future content, not referenced yet.
