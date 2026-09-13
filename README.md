# AZURA Portfolio

Personal portfolio platform (**AZURA Portfolio**) built with **Next.js 15**, **React 19**, **Tailwind CSS**, **MySQL**, and a custom **`/admin`** dashboard. The public site name defaults to **AZURA Portfolio** and can be renamed anytime in **Admin → Settings** (for example to `ahz`).

## Requirements

- Node.js 20.9+ (local) **or** Docker & Docker Compose
- MySQL 8 (provided by Compose)

## Quick start with Docker

```bash
cp .env.example .env
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
npx prisma db push
npm run db:seed
npm run dev
```

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint |
| `npm run db:setup` | Push schema + seed |
| `npm run db:seed` | Seed categories, projects, experience, settings |

## Stack

- Next.js 15 (Pages Router, Node runtime)
- MySQL 8 + Prisma
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
