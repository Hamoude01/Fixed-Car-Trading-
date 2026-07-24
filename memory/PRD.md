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
- Phase 1–5 (image bug, multi-photo, refactor, indexes, tested). DONE.
- Premium "Obsidian & Champagne" dark-luxe redesign across public site + admin.
- Customer "Sell Your Car" submission flow (PUBLIC, no login) with multi-photo upload → lands in admin Sell Requests inbox.
- Public Contact form → admin Messages inbox.
- Owner-only admin command-center (sidebar): Overview (stats), Listings CRUD, Sell Requests (status workflow + detail drawer), Messages (unread/read). Sidebar badges for pending/unread.
- AUTH MODEL: single owner/admin login at /admin/login ONLY. Customers never log in.
- Tests: backend 23/23 pytest passed; frontend 5/5 flows passed. Zero open issues.

## Backlog / Remaining
- P2: Email/SMS notification to owner on new sell request (needs SendGrid/Twilio integration).
- P2: One-click "Publish submission as listing" (convert accepted sell request → car listing).
- P2: Loading skeletons on admin overview; pagination as inventory grows.

## Next Tasks
- Port seller submission + contact inbox to admin, or add pagination/favorites as inventory grows.
