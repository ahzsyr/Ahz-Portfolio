# AZURA Portfolio

Personal portfolio platform (**AZURA Portfolio**) built with **Next.js 15**, **React 19**, **Tailwind CSS**, **MySQL**, and a custom **`/admin`** dashboard. The public site name defaults to **AZURA Portfolio** and can be renamed anytime in **Admin → Settings** (for example to `ahz`).

**Version:** 1.0.0 — see [docs/UPGRADE.md](docs/UPGRADE.md) for upgrades, seed modes, and compatibility guarantees.

## Requirements

- Node.js 20.9+ (local) **or** Docker & Docker Compose
- MySQL 8 (provided by Compose)

## Quick start with Docker

```bash
cp .env.example .env
# Set NEXTAUTH_SECRET and ADMIN_PASSWORD before production use
# Fresh empty DB only: RUN_SEED=true SEED_MODE=fresh
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Default credentials (change in `.env`):

- Email: `admin@azura.local`
- Password: `changeme`

## Local development

```bash
cp .env.example .env
# Start MySQL (Compose db only is fine), then:
npm install
npm run db:migrate
SEED_MODE=fresh npm run db:seed   # only on empty DB
npm run dev
```

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:push` | Dev-only schema push |
| `npm run db:setup` | Migrate + fresh seed (empty DB) |
| `npm run db:seed` | Seed (`SEED_MODE=safe` default) |
| `npm run db:backfill` | Backfill slugs / presentationMode |
| `npm test` | Unit tests |

## Stack

- Next.js 15 (Pages Router, Node runtime)
- MySQL 8 + Prisma (migrate deploy)
- NextAuth (Credentials) for admin
- Framer Motion, Swiper, Google Analytics
- nginx reverse proxy in Docker

## Renaming the brand

1. Sign in to `/admin`
2. Open **Settings**
3. Change **Site name** (e.g. from `AZURA Portfolio` to `ahz`)
4. Save — nav, footer, meta, and admin chrome update on the next request

## Contact form

Public `/contact` posts to `/api/contact` and stores messages in MySQL. Review them under **Admin → Messages**.
