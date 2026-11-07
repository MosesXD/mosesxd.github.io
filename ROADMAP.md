# Moses' Hub — Project Roadmap

Last reviewed: 7 November 2026  
Live site: https://mosesxd.github.io/  
Official repository: https://github.com/MosesXD/mosesxd.github.io

This checklist reflects what is present in the current `main` branch and what still needs a real-device or account-level check. A code review is not the same as a live test.

## Completed and verified in the repository

- [x] Multi-page site, navigation, themes, motion, and custom 404 page
- [x] Partners page, labelled ad system, and Services page
- [x] Search/share metadata, sitemap.xml, robots.txt, and LICENSE
- [x] Projects page with honest status labels
- [x] Lab statuses updated for the gaming library, 404 redesign, and themes
- [x] Dashboard clearly labelled as a layout preview with demo data and noindex
- [x] About gaming library, including the separate “Need to play again” shelf
- [x] Services “How it works” section redesign
- [x] Support page PayPal and WiPay QR prompt, with download and native sharing actions
- [x] GitHub profile README exists in the public MosesXD/MosesXD repository
- [x] Compared main, dev, and Features: dev is 20 commits behind and Features is 54 commits behind; neither is ahead of main

## Needs testing or verification

- [ ] Complete accessibility fixes F1–F4: menu state, focus visibility beneath the sticky header, large text, and theme panel on small screens
- [ ] Test every page and internal link on a real phone and desktop after recent merges
- [ ] Test keyboard navigation and visible focus states
- [ ] Test landscape layout, largest text setting, theme panel, and mobile menu on a real device
- [ ] Verify Discord, Instagram, PayPal, and WiPay flows; test the QR from a second device and the download/share actions on the same device
- [ ] Confirm Last.fm provider environment variables and a successful live Now Playing response; the UI and endpoints exist, but production operation is not yet confirmed
- [ ] Review README files in Island Ledger, Daymark, and other project repositories
- [ ] Verify current demo and repository links for each project card

## Planned

- [ ] Add real screenshots of the actual pages and projects
- [ ] Write a Moses' Hub case study
- [ ] Publish a visitor-facing roadmap page on the website
- [ ] Decide whether the dashboard should remain a preview or become a real data-backed feature

## Branch policy and current status

- `main` is the Official source of truth for the GitHub Pages site.
- `dev` is 20 commits behind `main` and has no unique commits to bring across.
- `Features` is 54 commits behind `main` and has no unique commits to bring across.
- No branch merge is recommended from either older branch at this review.
- Vercel is a separate deployment target; its current project configuration and live deployment have not been verified in this review.

## Release notes

The current documented release is **v2.7.0**. Work that has not been tested in production is explicitly marked as needing verification above.
