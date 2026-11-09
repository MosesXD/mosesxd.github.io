# Moses' Hub

My personal website, portfolio, and development playground. I use it to share projects, experiments, interests, and development updates while learning through practical work.

**Live website:** https://mosesxd.github.io/  
**GitHub profile:** https://github.com/MosesXD  
**Current documented release:** v2.8.0

## About
Moses' Hub began as a personal website and grew into a multi-page project. It brings together my portfolio, gaming library, updates, personal information, services, links, and experiments.

The site is built with HTML, CSS, and JavaScript and is hosted as a static website on GitHub Pages. Some optional integrations use separate serverless endpoints.

## What's inside
| Page | Purpose |
|---|---|
| Home | Introduction and shortcuts |
| Projects | Current projects, concepts, and experiments |
| Case study | The story behind building Moses' Hub |
| Roadmap | Completed work, current improvements, and future ideas |
| Games | Game development ideas and progress |
| Updates | Visitor-friendly development log |
| About | Personal introduction, gaming library, and Now Playing card |
| Links | Online profiles and contact links |
| Services | Website service information and pricing |
| Partners | Partner and featured content |
| Lab | Experiments and learning progress |
| Support | PayPal and WiPay QR support options |
| Trading | Preview only; no forms, payments, or offers |
| Gallery | Placeholder page |
| Dashboard | Layout preview only; not a live data dashboard |
| 404 | Custom page for broken links |

## Featured projects
| Project | Status | Main link |
|---|---|---|
| Moses' Hub | Live | [Website](https://mosesxd.github.io/) |
| Island Ledger | In development | [Official repository](https://github.com/MosesXD/Islandledger) |
| Daymark — Everyday Toolkit | In development | [Official repository](https://github.com/MosesXD/Daymark-toolkit) |
| Island Life | Concept; not playable | [Concept repository](https://github.com/MosesXD/island-life-concept) |
| First Game | In progress learning project | Details will be added as development progresses |
| Future API | Exploring | A possible future API and database for the site |

Island Ledger and Daymark concept previews are separate from their official repositories. The Projects page labels those links separately so a prototype is not mistaken for the official product.

Swarm Studio is a separate experiment. Its cursor effect is not integrated into Moses' Hub yet; that will be considered after the experiment is stable and ready to publish.

## Features
- Multi-page layout with shared navigation and footer patterns.
- Responsive layouts for phones and desktop screens.
- Dark, Light, Pink, and Auto themes, accent colour selection, and background styles saved on the visitor's device.
- Motion and scroll effects that respect reduced-motion preferences.
- Project cards with clear statuses and separate official/concept links.
- Gaming library with currently playing, previously played, comeback, and want-to-play sections.
- Services page with TTD and USD price display.
- Partner and labelled-ad configuration.
- Support page with PayPal and WiPay QR options.
- Share previews, sitemap, and cookie-free visitor analytics through Umami.

Some features still need live-provider or real-device verification. The public roadmap distinguishes implemented work from items that still need testing.

## Last.fm Now Playing
The About page includes a Now Playing interface backed by optional serverless endpoints. Netlify uses /.netlify/functions/now-playing; Vercel uses /api/now-playing. Both require the private LASTFM_API_KEY and LASTFM_USER environment variables.

GitHub Pages is static and cannot run serverless functions. The live integration depends on a separately hosted endpoint and correctly configured provider variables. A successful production response still needs to be verified. Credentials must never be committed or exposed in browser JavaScript.

## Built with
HTML, CSS, JavaScript, Git, GitHub, GitHub Pages, and optional Vercel/Netlify serverless endpoints. The main site has no framework or build step.

## Important files
- HTML files — individual pages.
- projects.html — project showcase.
- case-study.html and case-study-moses-hub.md — case study in web and Markdown formats.
- roadmap.html — public roadmap.
- style.css — shared layout, themes, and visual styling.
- script.js — shared navigation, theme, and motion behaviour.
- ads.js and services.js — partner/ad configuration and Services currency display.
- api/ and netlify/functions/ — optional serverless endpoints.
- CHANGELOG.md — version history.
- ROADMAP.md — detailed development checklist.
- sitemap.xml — public page index for search engines.

## Run locally
1. Clone or download this repository.
2. Open index.html in a browser, or serve the folder with a local static server.
3. Test changes at desktop and mobile sizes.
4. Check navigation, keyboard access, links, and interactive features before publishing.

## Security and privacy
- Do not commit passwords, API keys, private tokens, or bank details.
- Keep integration credentials in the relevant hosting provider's environment settings.
- The website does not process payments itself; support links lead to payment providers.
- Visitor analytics are configured without cookies.

## Development status
Moses' Hub is an active learning project. Features may be refined, replaced, or removed as the site evolves. The [public roadmap](https://mosesxd.github.io/roadmap.html) shows what is complete, what still needs verification, and what may come next.

The [Updates page](https://mosesxd.github.io/updates.html) explains shipped changes in a visitor-friendly format. The [Changelog](CHANGELOG.md) records release history.

## License
All rights reserved. See the LICENSE file.
