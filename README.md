# Taskora

Taskora is a project management SaaS I'm building with Next.js, TypeScript, PostgreSQL, and Prisma.

The goal is to build a production-style application around workspaces, projects, tasks, team collaboration, and role-based access.

## Stack

- Next.js 16
- React 19
- TypeScript
- PostgreSQL
- Prisma
- Tailwind CSS
- Zod
- bcrypt

## Current progress

- Landing page and application shell
- User registration
- Login and logout
- Database-backed sessions
- Protected dashboard
- PostgreSQL and Prisma setup

## Architecture

Taskora keeps request handling and business logic separate where it makes sense:

`Route Handler -> Validation -> Service -> Database`

Authentication uses server-side sessions. Session tokens are stored in HTTP-only cookies, while only hashed session tokens are persisted in the database.

## Running locally

Create a `.env` file with:

```env
DATABASE_URL="postgresql://..."
```

Then:

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000`.

`APP_URL` is optional in development. Login and signup accept requests from the origin the app is served on. If you open the dev server through a proxy or tunnel with a different public URL, set `APP_URL` to that URL.

## Deployment

Taskora is intended to run on Vercel with a managed PostgreSQL database that provides a connection pooler (for example Neon or Supabase).

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Connection used by the app. Use the pooled connection string, with `?pgbouncer=true` if the pooler runs PgBouncer in transaction mode. |
| `DIRECT_URL` | When `DATABASE_URL` is pooled | Direct connection used by Prisma Migrate. |
| `APP_URL` | Yes | Public URL of the deployment, such as `https://taskora.example.com`. Login and signup reject browser requests from any other origin. |

Preview deployments should use their own database, never the production one.

### Build and migrate

`npm run build` runs `prisma generate` before `next build`, so the Prisma Client is always generated from the committed schema.

Apply migrations to the production database with:

```bash
npx prisma migrate deploy
```

Never run `prisma migrate dev`, `prisma migrate reset`, or `prisma db push` against production.

### Rate limiting

Login and signup are rate limited with a Vercel Firewall rule, configured in the dashboard after the first deployment (Project → Firewall → Configure → New Rule):

- Name: `Auth rate limit`
- If: Request Path is any of `/api/auth/login`, `/api/auth/signup`, and Method equals `POST`
- Then: Rate Limit, Fixed Window, 60s window, 10 requests, keyed by IP Address
- Action: start with Log to check real traffic, then switch to the default 429
- Review Changes, then Publish

Hobby projects allow one rate limit rule, which is why both endpoints share it.

## Development

See [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) for the product and technical specification.