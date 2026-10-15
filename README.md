# Moses' Hub

My personal website and learning project: a hub for my projects, experiments, links, and updates. I'm learning web development by building, testing, and improving it over time.

**Live site:** https://mosesxd.github.io/

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
| Island Ledger: a TTD income and expense tracker that saves entries in the browser | In progress |
| Island Life: a concept and design document for a Caribbean life-sim game | Concept (not playable) |
| Everyday Toolkit: small tools for everyday tasks | Planned |

## Features

- Responsive layout for phones and desktop
- Dark, Light, Pink, and Auto themes, an accent color picker, and four background styles (saved on the visitor's own device)
- Scroll reveals, hover effects, and a page fade, all switched off for visitors who prefer reduced motion
- A partner and ad system controlled from one file (`ads.js`). Every ad is labelled, links open safely, and nothing is shown until it is switched on
- TTD and USD price switch on the Services page (`services.js`)
- Share previews for links posted on Discord and Instagram
- Cookie-free visit counts with Umami

## Prepared but not switched on

- **Last.fm "now playing"**: the front-end code is in `script.js` and `about.html`. It needs a server function and a host that supports it, so it is not active.

## Built with

- HTML for structure
- CSS for layout, themes, and animation
- JavaScript for the menu, themes, motion, ads, and the price switch
- GitHub and GitHub Pages for version control and hosting

No frameworks, no build step, and no server code. The site is fully static.

## Files

- `index.html` and the other `.html` files: page structure and content
- `style.css`: colors, layout, themes, and motion
- `script.js`: menu, themes, and motion
- `ads.js`: partner and ad entries (switch each on or off with `active`)
- `services.js`: the TTD and USD price switch
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

- [x] Multi-page structure
- [x] Themes, motion, and a custom 404 page
- [x] Partners page and ad system
- [x] Services page
- [x] Share previews and visit counts
- [x] Projects page with honest status labels
- [ ] Full test pass on phone and desktop, including keyboard navigation
- [ ] Real screenshots of each page
- [ ] Link my other projects once they are live
- [ ] Case study for this project

## Links

- GitHub profile: https://github.com/MosesXD
- Repository: https://github.com/MosesXD/mosesxd.github.io

## Why I'm building this

I like turning an idea into something real, and I'm learning more with every version. I document what works, what's in progress, and what I learn.

No license has been chosen yet.
