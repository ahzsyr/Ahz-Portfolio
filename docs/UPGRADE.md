# Upgrade guide — AZURA Portfolio v1.0

This release hardens migration and backward compatibility. **Existing projects stay valid** with classic fields only; metrics, achievements, stories, and visualizations remain optional.

## Architecture (descriptive)

```text
CONTENT          DATA              PRESENTATION       TEMPLATES
Projects         Metrics           KPI / Chart        Creative
Experience       Data points       Timeline           Business
Achievements     Targets           Gallery            Technical
Skills           Comparisons       Comparison         Career
Certifications   Time series       Progress           Minimal
Milestones                         Story blocks
```

Charts present first-class **data**; they are not required for a published portfolio.

## Fresh install

```bash
cp .env.example .env
# Set NEXTAUTH_SECRET to a long random string
# Set ADMIN_PASSWORD (change from changeme)
# Optional first boot: RUN_SEED=true SEED_MODE=fresh

docker compose up --build
# or locally:
npm install
npm run db:migrate
SEED_MODE=fresh npm run db:seed   # only on empty DB
npm run dev
```

`npm run db:setup` runs migrate + **fresh** seed (destructive demo reset). Prefer that only on empty databases.

## Upgrade an existing database

1. **Backup** MySQL and `public/uploads`.
2. Deploy the new code.
3. Ensure `.env` has `RUN_SEED=false` (default in `.env.example`).
4. Apply schema:

```bash
npm run db:migrate
# or in Docker: entrypoint runs `prisma migrate deploy`
```

5. Optional compat backfill (slugs / presentationMode gaps):

```bash
npm run db:backfill
```

6. Restart the app. Do **not** run `SEED_MODE=fresh` against production data.

### Already used `db push` before migrations?

If tables already exist and `migrate deploy` errors with **P3005**, mark the baseline as applied once:

```bash
npx prisma migrate resolve --applied 20250922000000_init
npx prisma migrate deploy
```

Docker entrypoint does this automatically when it sees P3005, then continues startup.

## URL compatibility

| URL | Behavior |
|-----|----------|
| `/projects`, `/about`, `/contact` | Unchanged |
| `/projects/{numericId}` | Still resolves; **301** to `/projects/{slug}` when slug ≠ id |
| `/impact` | Public impact page (may show empty state until data exists) |

## Fallbacks (unchanged)

- Project without published story blocks → classic case study layout
- Impact without story → Phase-3 style charts/KPIs when data exists
- Database unavailable → static `data/projects.js`, `data/experience.js`, `config/site.js`

## Seed modes

| Variable | Meaning |
|----------|---------|
| `RUN_SEED=false` | No seed on Docker boot (recommended for upgrades) |
| `RUN_SEED=true` + `SEED_MODE=safe` | Upsert demo data; does not wipe experience or CMS settings |
| `RUN_SEED=true` + `SEED_MODE=fresh` | Destructive demo reset (experience wipe, settings overwrite) |

## Security checklist

- Set a strong `NEXTAUTH_SECRET` (production refuses weak placeholders)
- Change `ADMIN_PASSWORD` from the example value
- Admin UI and `/api/admin/*` remain auth-gated
- Contact form: honeypot + rate limit + email validation

## Performance / accessibility notes (manual)

- Homepage featured KPIs load without full time-series payloads
- `/sitemap.xml` and `/robots.txt` send short public `Cache-Control`
- Skip link (“Skip to main content”) on public pages; `:focus-visible` styles in globals
- Prefer Lighthouse locally after deploy; no CI gate required

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:push` | Dev-only schema push |
| `npm run db:seed` | Seed (`SEED_MODE` controls safety) |
| `npm run db:backfill` | Compat slug / presentationMode backfill |
| `npm test` | Unit tests |
