# SubGuard — B2B SaaS Subscription Manager

> Bring order to your software stack. Automate access requests, eradicate shadow IT, and optimize your SaaS spend — all from one unified workspace.

---

## Overview

**SubGuard** is an internal B2B SaaS dashboard built for mid-sized enterprises to track, request, and manage monthly software subscriptions. It prevents shadow IT, eliminates wasted spend, and gives IT and Finance teams full visibility and control over their company's SaaS portfolio.

Built as part of the **Ailoitte Velocity Pod Hackathon** (48-hour sprint).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript (strict mode) |
| Styling | Inline CSS with CSS variables — zero external UI libs |
| Auth & DB | Supabase (Auth + PostgreSQL) |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| E2E Testing | Playwright |
| Deployment | Vercel |

---

## User Roles

### Workspace User (Employee)
- View their own active software licenses
- Submit new software access requests with tool name, cost, and business justification
- Track the status of pending requests (Pending / Approved / Denied)

### IT & Finance Leaders (Admin)
- View the full company dashboard with total monthly SaaS spend
- See all active subscriptions across the organisation
- Approve or deny employee software requests in one click
- Approved tools are automatically added to spend calculations and employee dashboards

---

## Project Structure

```
subguard/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard (spend overview, approvals)
│   ├── dashboard/
│   │   └── page.tsx          # Employee dashboard (my tools, requests)
│   ├── login/
│   │   └── page.tsx          # Login page with role-based redirect
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Root redirect to /login
├── lib/
│   └── supabase.ts           # Supabase client initialisation
├── e2e/
│   └── subguard.spec.ts      # Playwright E2E test suite (3 mandatory flows)
├── public/
├── .env.example              # Environment variable template (no real values)
├── playwright.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## Database Schema

All tables live in Supabase (PostgreSQL). UUIDs are used throughout. Row Level Security (RLS) is enabled on all tables.

```sql
-- Users (mirrors Supabase Auth)
users (
  id        uuid PRIMARY KEY,   -- matches auth.users.id
  email     text UNIQUE,
  role      text CHECK (role IN ('admin', 'employee'))
)

-- Active subscriptions
subscriptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name     text,
  monthly_cost  numeric,
  user_id       uuid REFERENCES users(id)
)

-- Software access requests
requests (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name      text,
  monthly_cost   numeric,
  justification  text,
  status         text CHECK (status IN ('pending', 'approved', 'denied')),
  requested_by   uuid REFERENCES users(id)
)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/s-swaraj-devops/subguard-hackathon-ailoitte.git
cd subguard-hackathon-ailoitte
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Playwright E2E test credentials
TEST_ADMIN_EMAIL=your_admin_email
TEST_ADMIN_PASSWORD=your_admin_password
TEST_EMPLOYEE_EMAIL=your_employee_email
TEST_EMPLOYEE_PASSWORD=your_employee_password
```

> ⚠️ Never commit `.env.local` — it is listed in `.gitignore`.

### 3. Seed the database

Run the following in the [Supabase SQL Editor](https://supabase.com/dashboard):

```sql
-- Create auth users first via Supabase Auth dashboard or API
-- Then insert into public users table with matching UUIDs
INSERT INTO users (id, email, role) VALUES
  ('<admin-auth-uuid>',    'admin@yourcompany.com',    'admin'),
  ('<employee-auth-uuid>', 'employee@yourcompany.com', 'employee');
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## E2E Testing

Manual testing is **strictly forbidden** per the hackathon mandate. The Playwright suite must pass all three flows automatically.

### Prerequisites

```bash
npx playwright install chromium
npm install -D @playwright/test dotenv
```

### Configure test credentials

Ensure your `.env.local` has the `TEST_*` variables set (see Environment Variables section above).

### Run tests

```bash
npx playwright test
```

### Test flows covered

| # | Flow | Description |
|---|---|---|
| 1 | Admin login + spend | Admin logs in and views the correct total monthly SaaS spend |
| 2 | Employee request | Employee logs in and submits a new $50/mo software request |
| 3 | Admin approval | Admin approves the request; total spend increases by exactly $50 |

Tests run sequentially (1 worker) — Flow 2 must precede Flow 3. Results saved to `playwright-report/`.

### Type-check before running tests

```bash
npx tsc --noEmit
```

Zero errors required. The codebase enforces **strict TypeScript** — no `any` types allowed.

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "feat: SubGuard release"
git push origin main
```

### 2. Import to Vercel

Go to [vercel.com/new](https://vercel.com/new), import your GitHub repo, and set the following environment variables in **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

> Note: `TEST_*` variables are only needed locally for Playwright — do not add them to Vercel.

### 3. Deploy

Vercel will auto-detect Next.js and deploy. No build configuration needed.

---

## Security

| Measure | Detail |
|---|---|
| No hardcoded credentials | Zero credentials in source code — all via environment variables |
| Supabase Auth | JWT-based authentication via `signInWithPassword` |
| Role enforcement | Role fetched from `users` table post-login — never trusted from client |
| Row Level Security | RLS enabled on `users`, `requests`, `subscriptions` tables |
| Strict TypeScript | `strict: true` in `tsconfig.json` — no `any` types anywhere |
| Environment variables | `.env.local` excluded from version control via `.gitignore` |
| `.env.example` | Placeholder template committed — no real values |

---

## Hackathon Context

| Field | Value |
|---|---|
| Event | Ailoitte Velocity Pod Hackathon |
| Time limit | 48 hours |
| Team composition | 1 Architect + 1 Agentic QA Engineer |
| Submission requirement | GitHub repo with passing Playwright E2E suite |
| Deployment | Vercel (live) |

---

## License

MIT — built for hackathon purposes.