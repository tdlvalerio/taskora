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

## Development

See [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) for the product and technical specification.