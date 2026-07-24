# Car Trading Ireland — PRD

## Original Problem Statement
Car listing & selling marketplace (repo: Hamoude01/car-trading-ireland, live hamoudecartrade.ie).
Primary bug: images upload but don't display publicly. Feature: multi-photo per listing visible to
visitors. Refactor: clean code, performance, restructure DB. Original app was Next.js + Supabase;
rebuilt to target stack React + FastAPI + MongoDB + Object Storage.

## Architecture
- Frontend: React (CRA), react-router, Tailwind, sonner, lucide-react. Design: Swiss high-contrast (Outfit/Manrope, emerald accent).
- Backend: FastAPI, Motor/MongoDB, JWT auth (bcrypt + PyJWT), Emergent Object Storage, Pillow compression.
- Images stored in object storage; DB holds clean public URLs (`/api/files/{path}`) served through backend (no auth) — fixes the display bug.

## User Personas
- Buyer: browses/filters listings, views multi-image grid gallery + specs, contacts seller.
- Admin: JWT login, CRUD listings, multi-photo upload with preview/reorder/set-cover/delete.

## Core Requirements (static)
- Public: browse with filters (make, fuel, county, price, search, sort), detail page with image grid gallery.
- Admin: secure login, listing CRUD, multi-photo upload flowing through to public view.
- Performance: image compression, lazy loading, immutable cache headers, indexes on price/make/model/county/dateAdded.

## Implemented (2026-07-24)
- Phase 1–2: Object storage + clean public URLs, `images` array on listing model, public grid gallery. DONE.
- Phase 3: Admin multi-photo upload with preview grid, reorder (drag), set-cover, delete. DONE.
- Phase 4: Standardized code structure (lib/, context/, pages/, components/), Pillow compression, lazy loading, DB indexes. DONE.
- Phase 5: Backend 17/17 pytest passed; frontend Playwright e2e passed. Image bug fix verified end-to-end.
- Auth: JWT admin (admin@hamoudecartrade.ie / hamoude2024), seeded on startup.
- Seed: 4 sample cars with images.

## Backlog / Remaining
- P1: "Sell your car" submission form + contact messages (existed in original Next.js repo; not yet ported).
- P2: Per-field data-testids on CarForm text inputs; server-side required-field/year validators.
- P2: Restrict CORS origins; split server.py into route modules if it grows.
- P2: Responsive image sizes (srcset) / thumbnail variants.

## Next Tasks
- Port seller submission + contact inbox to admin, or add pagination/favorites as inventory grows.
