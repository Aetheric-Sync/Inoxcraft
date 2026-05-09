# INOXCRAFT
Web-based quotation and project management system for stainless steel fabrication.

## Stack
- Next.js 14 (App Router)
- TypeScript (strict mode)
- PostgreSQL (Neon) via Prisma ORM
- NextAuth.js v5
- Tailwind CSS + shadcn/ui
- Vitest + Playwright
- Vercel (deployment)
- Resend (email)
- Upstash Redis (rate limiting)

## Getting started
1. Copy .env.example to .env.local and fill in all values
2. Run: npm install
3. Run: npx prisma migrate dev
4. Run: npx prisma db seed
5. Run: npm run dev
