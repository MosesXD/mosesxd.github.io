# Moses' Hub

My personal website and learning project: a hub for my projects, experiments, links, and updates. I'm learning web development by building, testing, and improving it over time.

**Live site:** https://mosesxd.github.io/

**Current documented release:** v2.5.4 (documentation-only correction)

## Status

Active learning project. Everything listed under "What's inside" exists. Items marked *preview* or *prepared* are not fully switched on, and I say so below.

## What's inside

| Page | What it is |
|---|---|
| Home | What the hub is, plus quick links |
| Projects | Things I'm building, with honest status labels |
| Games | Game plans and progress |
| Updates | The dev log (newest first) |
| About | About the owner |
| Links | Discord, GitHub, Instagram, an email contact, services, and partners |
| Services | Starter website packages with TTD and USD prices |
| Partners | Partner and featured spots, controlled from one file |
| Lab | Experiments and things I'm learning |
| Trading | **Preview only.** No forms, payments, or offers |
| Support | PayPal link. A local option is planned |
| Gallery | Placeholder page |
| Dashboard | **Layout preview only.** Not linked from the menu, no real numbers |
| 404 | Custom page for broken links |

## Projects

| Project | Status |
|---|---|
| Moses' Hub (this site) | Live |
| First Game: a beginner-friendly game I want to build after the website | In progress |
| Island Life: a concept and design document for a Caribbean life-sim game | Concept (not playable) |
| Island Ledger: a TTD income and expense tracker that saves entries in the browser | In progress ([main repository](https://github.com/MosesXD/Islandledger)) |
| Everyday Toolkit: small tools for everyday tasks | In progress ([main repository](https://github.com/MosesXD/Daymark-toolkit)) |
| Future API: this site's own API and database | Later |

## Features

- Responsive layout for phones and desktop
- Dark, Light, Pink, and Auto themes, an accent color picker, and four background styles (saved on the visitor's own device)
- Scroll reveals, hover effects, and a page fade, all switched off for visitors who prefer reduced motion
- A partner and ad system controlled from one file (`ads.js`). Every ad is labelled, links open safely, and nothing is shown until it is switched on
- TTD and USD price switch on the Services page (`services.js`)
- Share previews for links posted on Discord and Instagram
- Cookie-free visit counts with Umami

## Last.fm "Now Playing"

The About page can show the track currently playing (or the most recently played track) from Last.fm.

- Netlify endpoint: `/.netlify/functions/now-playing`
- Vercel endpoint: `/api/now-playing`
- Both providers use the same private environment variables: `LASTFM_API_KEY` and `LASTFM_USER`.
- Add both variables in each provider's project settings, then redeploy.
- The API key stays on the server and is never included in browser JavaScript.
- The front end tries the matching provider endpoint and falls back to the other one.

GitHub Pages is static and cannot run either function itself. If GitHub Pages remains the production host, the feature will need to call a separately hosted backend with an explicitly configured endpoint and appropriate access controls.

## Built with

- HTML for structure
- CSS for layout, themes, and animation
- JavaScript for the menu, themes, motion, ads, and the price switch
- Serverless functions for the optional Last.fm integration on Netlify and Vercel
- GitHub and GitHub Pages for version control and hosting

No frameworks, no build step, and no server code. The site is fully static.

## Files

- `index.html` and the other `.html` files: page structure and content
- `style.css`: colors, layout, themes, and motion
- `script.js`: menu, themes, and motion
- `ads.js`: partner and ad entries (switch each on or off with `active`)
- `services.js`: the TTD and USD price switch
- `images/ads/`: pictures used by ads
- `sitemap.xml` and `robots.txt`: help search engines find the pages
- `netlify/functions/now-playing.js`: Netlify Last.fm function
- `api/now-playing.js`: Vercel Last.fm function
- `LICENSE`: all rights reserved
- `CHANGELOG.md`: version history

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a browser.
3. Edit the files, then test on a phone-sized screen and a desktop screen before publishing.

## Security and privacy

- No passwords, API keys, or bank details are stored in this repository, and none belong here.
- Payments are not handled by this site. The Support page links out to a payment provider.
- Visitor analytics use no cookies.

## Roadmap

- [x] Multi-page structure, navigation, themes, motion, and a custom 404 page
- [x] Partners page, ad system, and Services page
- [x] Share previews, sitemap, robots.txt, and license
- [x] Projects page with honest project status labels
- [x] README, CHANGELOG, and Updates page maintained as project documentation
- [ ] Reconcile and review main, dev, and Features before deciding what should merge
- [ ] Complete accessibility fixes from the audit (menu state, focus visibility, large text, and small-screen theme panel)
- [ ] Repeat a full phone and desktop test, including keyboard navigation, after the next approved merge
- [ ] Add real screenshots of the actual pages and projects
- [ ] Add demo and repository links to relevant project cards
- [ ] Write a case study for Moses' Hub
- [ ] Verify the GitHub profile README and project READMEs
- [ ] Add a public project roadmap with completed, in-progress, planned, and paused statuses
- [ ] Explore a live gaming activity status integration (where a game platform exposes a reliable presence API); keep manual currently-playing status as the fallback

## Links

- GitHub profile: https://github.com/MosesXD
- Repository: https://github.com/MosesXD/mosesxd.github.io

## Why I'm building this

I like turning an idea into something real, and I'm learning more with every version. I document what works, what's in progress, and what I learn.

All rights reserved. See the LICENSE file.
