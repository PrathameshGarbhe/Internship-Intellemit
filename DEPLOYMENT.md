# Deploying IntellMeet

This is a two-part app: a Vite/React frontend (`client/`) and an Express +
Socket.io backend (`server/`). They deploy to **different places**.

Vercel is serverless and can't hold the persistent connections that
Socket.io / WebRTC signaling need, so only the frontend goes on Vercel.
The backend needs a host that runs a long-lived process
(Railway, Render, Fly.io, or a VPS).

---

## 1. Deploy the backend first

Pick one: **Railway** or **Render** are the fastest for this stack.

1. Push this repo to GitHub (or connect the folder directly).
2. Create a new service, root directory: `server`.
3. Build command: `npm install && npm run build`
   Start command: `npm start`
4. Copy `server/.env.example` → set these as environment variables on the host:
   - `PORT` — most hosts inject this automatically, you can leave it out
   - `NODE_ENV=production`
   - `MONGO_URI` — your MongoDB Atlas (or other) connection string
   - `JWT_SECRET` / `JWT_REFRESH_SECRET` — long random strings
   - `CLIENT_URL` — leave as a placeholder for now (e.g. `http://localhost:3000`),
     you'll update it after step 2 once you know your Vercel URL
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` —
     only needed if you use "Continue with Google"
5. Deploy. Note the resulting URL, e.g. `https://intellmeet-api.up.railway.app`.

## 2. Deploy the frontend on Vercel

1. Import the repo into Vercel.
2. **Root Directory:** set to `client` (important — this is a monorepo).
3. Framework preset: Vite (auto-detected).
4. Add environment variables (Project Settings → Environment Variables),
   using the backend URL from step 1:
   ```
   VITE_API_URL=https://intellmeet-api.up.railway.app/api
   VITE_SOCKET_URL=https://intellmeet-api.up.railway.app
   ```
   These are read at **build time**, so they must be set before you deploy —
   changing them later requires a redeploy.
5. Deploy. `client/vercel.json` already contains the SPA rewrite rule so
   client-side routes like `/dashboard` or `/meeting-room/:code` won't 404
   on refresh.
6. Note your Vercel URL, e.g. `https://intellmeet.vercel.app`.

## 3. Close the loop: update backend CORS

Go back to your backend host's environment variables and set:
```
CLIENT_URL=https://intellmeet.vercel.app
```
Redeploy the backend. This is what both Express's CORS middleware and
Socket.io's CORS config read to allow requests from your deployed frontend
(see `server/src/app.ts` and `server/src/server.ts`).

## 4. Verify

- Visit your Vercel URL, register/login.
- Create a meeting, join it in two browser tabs, confirm video/chat work
  (this exercises the Socket.io connection to your backend).
- Create a task on the Kanban board and refresh to confirm it's not falling
  back to the offline/mock mode (that fallback only activates if the
  `/api/tasks` request fails — a good signal something in steps 1–3 is
  misconfigured if you see it in production).

---

### Notes

- WebRTC in `MeetingRoom.tsx` currently establishes local media only
  (no TURN/STUN server config was present in the original project). If
  participants are on different networks and video doesn't connect,
  you'll likely need to add a TURN server (e.g. via Twilio or coturn) —
  this is a backend/infra addition, not something introduced by the
  frontend redesign.
- If you don't use Google OAuth, you can omit the `GOOGLE_*` variables —
  the server starts up fine without them (this used to crash the server;
  fixed) and the "Continue with Google" button on the login/register pages
  will just return a clean "not configured" message instead of working.
