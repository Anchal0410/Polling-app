# Real-Time Poll Rooms

A web app to create polls, share them via a link, and collect votes with **real-time results** for all viewers.

## Features

- **Poll creation** – Create a poll with a question and 2+ options; get a shareable link.
- **Join by link** – Anyone with the link can view the poll and vote (single choice).
- **Real-time results** – When anyone votes, all viewers see updated results without refreshing (polling every 2 seconds; with Supabase, you can also use Realtime for instant updates).
- **Fairness / anti-abuse** – Two mechanisms (see below).
- **Persistence** – With Supabase configured, polls and votes are stored in Postgres so the link keeps working after refresh and across sessions.

## Quick start (no database)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase, the app uses **in-memory storage**: data is lost when the dev server restarts. Suitable for local testing only.

---

## How to run and test end-to-end

### Step 1: Install and start the app

```bash
cd poll-app
npm install
npm run dev
```

Wait until you see **Ready** and **Local: http://localhost:3000**. Leave this terminal open.

### Step 2: Create a poll

1. In your browser, go to **http://localhost:3000**.
2. Click **Create a poll**.
3. Enter a **question** (e.g. “What should we order for lunch?”).
4. Enter at least **2 options** (e.g. “Pizza”, “Sushi”, “Salad”).
5. Click **Create poll**.
6. You should be redirected to the poll page with a **shareable link** and a “Poll created” message.

### Step 3: Copy the share link and open in another tab/window

1. On the poll page, copy the link using the **Copy link** button (you should see “Copied!”).
2. Open a **new browser tab** (or a **different browser** / **incognito window** to simulate another person).
3. Paste the link and press Enter (e.g. `http://localhost:3000/poll/XXXXXXXXXX`).
4. You should see the same poll and the option buttons to vote.

### Step 4: Vote and see real-time results

1. In the **new tab/window**, select one option and click **Submit vote**.
2. That tab should switch to “You’ve already voted” and show **live results** (bars and counts).
3. In the **original tab** (creator view), within a few seconds you should see the **same updated results** at the bottom (“Live results”) **without refreshing**.
4. Optionally open the link in a third tab, vote from there, and watch both the first and second viewer tabs update.

### Step 5: Verify anti-abuse (optional)

1. In the tab where you already voted, try voting again. You should **not** see the vote form (you already voted).
2. In a **new incognito/private window**, open the same poll link and vote. That should work once.
3. Try voting again in that same incognito window. You should get an error like **“You have already voted in this poll”** or **“Only one vote per device/network is allowed”** (IP limit).

### Step 6: Invalid link (optional)

1. Go to **http://localhost:3000/poll/invalid-slug-123**.
2. You should see **“Poll not found”** and a **Go home** button.

---

**Note:** If you use in-memory storage (no Supabase), restarting `npm run dev` clears all polls. Create a new poll and repeat the steps above to test again.

---

## Get a public (non-localhost) URL

Right now your poll links look like `http://localhost:3000/poll/EsLZPm0Yf_`. To get a **shareable URL** that works from other devices or for others (e.g. `https://something.vercel.app/poll/EsLZPm0Yf_`), use one of these:

### Option A: Quick tunnel (temporary URL, no deploy)

Good for: testing on your phone, sharing with a friend for a few hours. Your app keeps running on your PC.

1. **Keep the app running:** In one terminal, `npm run dev` (localhost:3000).
2. **Install a tunnel tool** (pick one):
   - **ngrok:** Download from [ngrok.com](https://ngrok.com/download) or run `npm install -g ngrok`. Sign up for a free account and run `ngrok http 3000`.
   - **localtunnel:** Run `npx localtunnel --port 3000` (no signup).
3. You’ll get a URL like `https://abc123.ngrok.io` or `https://xyz.loca.lt`. That is your **public base URL**.
4. **Open the app using that URL** (e.g. `https://abc123.ngrok.io`), not localhost. Create your poll from there. The **Copy link** button will then use the tunnel URL (e.g. `https://abc123.ngrok.io/poll/EsLZPm0Yf_`), so you can share it as-is.
5. **If you opened the app via localhost:** The copied link will show localhost. In that case, either open the app again via the tunnel URL and create/share the poll from there, or manually replace `http://localhost:3000` with your tunnel URL in the copied link.

### Option B: Deploy to Vercel (permanent public URL) — recommended

Good for: a stable, always-on URL like `https://your-poll-app.vercel.app`. Poll links will use this URL automatically.

1. **Push your code to GitHub** (if not already):
   - Create a repo on [github.com](https://github.com), then in your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
   - Click **Add New… → Project**, import your GitHub repo, select the **poll-app** folder (or root if the repo is only the app).
   - Leave **Build Command** as `npm run build` and **Output Directory** as default.
   - If you use **Supabase**, add **Environment Variables** in Vercel:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL (`https://xxx.supabase.co`)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key  
     (Without these, the deployed app uses in-memory storage; data won’t persist across serverless invocations.)
   - Click **Deploy**.

3. **Use your public URL:**  
   Vercel will give you a URL like `https://poll-app-xxx.vercel.app`. Open that in the browser. When you create a poll and click **Copy link**, the link will use this URL (e.g. `https://poll-app-xxx.vercel.app/poll/EsLZPm0Yf_`). Share that link; anyone can open it.

4. **Optional – custom domain:** In the Vercel project, go to **Settings → Domains** to add your own domain.

---

## Production: persistent storage (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the contents of `supabase/schema.sql` to create `polls`, `options`, and `votes` (and enable Realtime on `votes` if desired).
3. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL` – **Project URL** from Supabase (Project Settings → API), e.g. `https://xxxx.supabase.co`. Do **not** use the Postgres connection string (`postgresql://...`).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – your project **anon public** key from the same API settings.
4. Restart the dev server or redeploy. Polls and votes are now persisted and share links remain valid.

## Fairness / anti-abuse mechanisms

1. **Browser fingerprint (one vote per browser)**  
   - A fingerprint is stored in `localStorage` and sent with each vote.  
   - The server rejects a second vote for the same poll from the same fingerprint.  
   - **Prevents:** Casual double voting from the same device/browser.  
   - **Limitations:** Clearing site data or using another browser/incognito allows another vote; fingerprint is not cryptographically strong.

2. **IP-based limit (one vote per IP per poll)**  
   - The server hashes the client IP (from `X-Forwarded-For` or `X-Real-IP`) and stores it with the vote.  
   - Only one vote per poll per hashed IP is allowed.  
   - **Prevents:** Multiple votes from the same network/device when fingerprint is bypassed (e.g. incognito).  
   - **Limitations:** Shared networks (e.g. offices, schools) share one IP, so only one person on that network can vote per poll; VPNs can change IP to vote again.

## Edge cases handled

- Poll not found (invalid or missing slug) → 404 and “Poll not found” page.
- Vote with invalid or missing `optionId` / `voterFingerprint` → 400.
- Duplicate vote (same fingerprint or same IP) → 409 with a clear “already voted” message.
- Create poll with &lt; 2 options or empty question → 400 with validation message.
- Empty or invalid option texts are stripped; at least 2 non-empty options required.
- Copy share link with one click; feedback “Copied!” so users know the link was copied.

## Known limitations / possible improvements

- **Storage:** Without Supabase, data is in-memory only and is lost on restart (and on serverless, between invocations). For production, Supabase (or another DB) is required.
- **Real-time:** Without Supabase Realtime, the app uses **polling every 2 seconds** for live results. With Supabase, you can subscribe to the `votes` table for instant updates.
- **Fairness:** Fingerprint + IP limit reduce abuse but can be bypassed (e.g. incognito + VPN). Stronger options would be: sign-in, CAPTCHA, or email verification.
- **Scale:** No pagination for options (currently capped at 10 in the UI); for very high vote counts, consider caching or materialized counts.
- **Moderation:** No admin UI to close or delete polls; anyone with the link can view and vote as long as the poll exists.

## Deployment

- **Vercel:** Connect the repo, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in project settings, and deploy. Use Supabase for persistence (in-memory does not persist on serverless).
- Share the deployed app URL (e.g. `https://your-app.vercel.app`) as the public URL. The share link for a poll will be `https://your-app.vercel.app/poll/<slug>`.

## Tech stack

- **Next.js** (App Router), **React**, **TypeScript**, **Tailwind CSS**
- **Supabase** (optional): Postgres + optional Realtime
- **nanoid** for poll and option IDs and URL-safe slugs
