# Chronicle

Chronicle is a Goal Setting & Tracking Portal for Atomberg Technologies, built around the idea that every employee's work year is a living story. Goals are chapters, quarterly updates are plot updates, manager approval is the editor's sign-off, and admin controls are the publishing house.

## Tech Stack

- Frontend: React, Vite, TailwindCSS, shadcn-style primitives
- Backend: Node.js, Express
- ORM: Prisma
- Database: PostgreSQL, ready for Supabase
- Auth: JWT in httpOnly cookies
- Charts: Recharts
- Email and scheduling: Nodemailer, node-cron

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the backend environment file:

   ```bash
   cp server/.env.example server/.env
   ```

3. Set `DATABASE_URL` in `server/.env` to your Supabase or local PostgreSQL connection string.

4. Generate Prisma client and run migrations:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Seed demo data:

   ```bash
   npm run seed
   ```

6. Run both apps:

   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:5173`. Backend runs on `http://localhost:4000`.

## Demo Logins

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@chronicle.app` | `admin123` |
| Manager | `manager@chronicle.app` | `manager123` |
| Employee | `employee1@chronicle.app` | `emp123` |
| Employee | `employee2@chronicle.app` | `emp123` |
| Employee | `employee3@chronicle.app` | `emp123` |

## Key Validation Rules

- Goal sheet weightage must total exactly 100%.
- Each goal must have at least 10% weightage.
- Each sheet can contain at most 8 goals.
- Approved goals are locked unless an admin unlocks them.
- Shared goal recipients can only change weightage.
- Quarterly achievement input is allowed only when that quarter's cycle window is open.

## Project Structure

```text
chronicle/
├── client/
├── server/
└── README.md
```
