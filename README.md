# GoalQuest 🎯

A goal tracking app with countdowns, accountability partners, scoring, and motivational quotes.

## Features

- **Goal tracking** with live countdowns (days / hrs / min / sec)
- **Day milestone notifications** — alerts at 7, 3, and 1 day remaining
- **Completed goals history** with total score tracking
- **User registration & points** — earn points on every completed goal
- **Motivational quotes** — rotates every 6 hours automatically
- **Accountability partners** — add friends, view their goals, send nudges

---

## Setup Guide

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, give it a name (e.g. `goalquest`)
3. Once created, go to **Settings → API**
4. Copy your **Project URL** and **anon/public key** — you'll need these shortly

### Step 2 — Set up the database

1. In your Supabase project, go to **SQL Editor**
2. Open the file `src/lib/supabase.js` in this project
3. Copy the entire SQL block from the comment at the top (everything between the `/*` and `*/`)
4. Paste it into the SQL Editor and click **Run**

This creates the following tables:
- `profiles` — user accounts and scores
- `goals` — individual goals with deadlines and points
- `friendships` — accountability partner connections
- `nudges` — accountability messages between friends

### Step 3 — Configure environment variables

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Fill in your Supabase values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 4 — Run locally

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Deploying to Vercel (free)

### Option A — Via Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Option B — Via GitHub + Vercel Dashboard

1. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/goalquest.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **Add New Project** → import your repository
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy**

Vercel will give you a free `.vercel.app` URL instantly.

---

## Project Structure

```
goalquest/
├── src/
│   ├── components/
│   │   ├── GoalCard.jsx          # Goal card with live countdown
│   │   ├── AddGoalModal.jsx      # Create new goal modal
│   │   ├── NudgeModal.jsx        # Send accountability message
│   │   └── NotificationsPanel.jsx # Bell icon + notification dropdown
│   ├── hooks/
│   │   ├── useAuth.jsx           # Auth context (login, register, profile)
│   │   └── useCountdown.js       # Live countdown timer hook
│   ├── lib/
│   │   ├── supabase.js           # Supabase client + DB schema (SQL comment)
│   │   └── quotes.js             # Motivational quotes, 6-hour rotation
│   ├── pages/
│   │   ├── AuthPage.jsx          # Login / Register
│   │   ├── DashboardPage.jsx     # Main goals dashboard
│   │   ├── FriendsPage.jsx       # Friends & accountability
│   │   └── HistoryPage.jsx       # Completed goals tracker
│   ├── App.jsx                   # Root layout, navigation, quote header
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Full app styles
├── index.html
├── vite.config.js
├── vercel.json
├── .env.example
└── package.json
```

---

## Adding More Requirements Later

The codebase is structured for easy extension:

- **New pages** → add to `src/pages/` and register in `App.jsx`
- **New notifications** → extend `NotificationsPanel.jsx`
- **Leaderboard** → query `profiles` table ordered by `score`
- **Goal categories/tags** → add a `category` column to the `goals` table
- **Push notifications** → integrate a service worker with the Web Push API
