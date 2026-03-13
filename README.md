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
| Frontend | Next.js 14 (App Router), TypeScript (strict) |
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
│   └── page.tsx              # Root redirect
├── lib/
│   └── supabase.ts           # Supabase client initialisation
├── e2e/
│   └── subguard.spec.ts      # Playwright E2E test suite
├── public/
├── .env.local                # Supabase credentials (not committed)
├── playwright.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## Database Schema

All tables live in Supabase (PostgreSQL). UUIDs are used throughout.

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
git clone https://github.com/your-org/subguard.git
cd subguard
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Seed the database

Run the following in the [Supabase SQL Editor](https://supabase.com/dashboard):

```sql
-- Insert test users (IDs must match Supabase Auth user IDs)
INSERT INTO users (id, email, role) VALUES
  ('<admin-auth-uuid>',    'admin@subguard.com',    'admin'),
  ('<employee-auth-uuid>', 'employee@subguard.com', 'employee');
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Credential | Value |
|---|---|
| Admin email | `admin@subguard.com` |
| Admin password | `Admin@123` |
| Employee email | `employee@subguard.com` |
| Employee password | `Employee@123` |

---

## E2E Testing

Manual testing is **not accepted** for submission. The Playwright suite must pass all three flows automatically.

### Install Playwright

```bash
npx playwright install chromium
```

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

Tests run sequentially (Flow 2 must precede Flow 3). Results are saved to `playwright-report/`.

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "feat: initial SubGuard release"
git push origin main
```

### 2. Import to Vercel

Go to [vercel.com/new](https://vercel.com/new), import your GitHub repo, and set the following environment variables in **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Deploy

Vercel will auto-detect Next.js and deploy. No build configuration needed.

### 4. Type-check before pushing

```bash
npx tsc --noEmit
```

Zero errors required. The codebase enforces **strict TypeScript** — no `any` types allowed.

---

## Security

- No hardcoded credentials anywhere in the codebase
- All auth handled by Supabase Auth (JWT-based)
- Role is fetched server-side from the `users` table post-login — not trusted from the client
- Strict TypeScript mode enabled (`tsconfig.json`)
- Environment variables kept out of version control via `.gitignore`

---

## Hackathon Context

| Field | Value |
|---|---|
| Event | Ailoitte Velocity Pod Hackathon |
| Time limit | 48 hours |
| Team | 1 Architect + 1 Agentic QA Engineer |
| Submission requirement | GitHub repo with passing Playwright E2E suite |

---

## License

MIT — built for hackathon purposes.
