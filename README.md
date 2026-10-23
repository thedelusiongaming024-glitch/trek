# Trek Consultancy Forum

The official community discussion forum and support portal for Trek Consultancy: topics and threaded replies, an admin panel, a knowledge base, and an AI support assistant backed by Gemini/OpenAI and a PostgreSQL-stored FAQ/knowledge base.

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4
- **Backend & Server:** Node.js + Express (`server.ts` & `src/server/app.ts`)
- **Database:** Neon PostgreSQL (`@neondatabase/serverless`)
- **AI & Email:** Google Gemini (`@google/genai`), Resend (`resend`)

## Local Development

**Prerequisites:** Node.js 18+ and a Neon PostgreSQL database.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and configure your environment variables:
   - `DATABASE_URL` — Neon PostgreSQL connection string
   - `GEMINI_API_KEY` — API key for AI support assistant and document extraction (can also be configured in Admin Panel)
   - `RESEND_API_KEY` — Resend API key for OTP verification emails (can also be configured in Admin Panel -> Newsletter)
   - `EMAIL_FROM` — Verified sender address (e.g. `Trek Consultancy Forum <noreply@yourdomain.com>`)
   - `SESSION_SECRET` — Random 32+ character secret for signing session tokens
3. Start the development server:
   ```bash
   npm run dev
   ```
   This starts Express with Vite middleware on `http://localhost:3000`. Database tables are initialized automatically on startup.

## Deploying to Hostinger

### Option A: Hostinger Node.js Web App (hPanel / Cloud / Business Hosting)

1. Push your repository to GitHub or upload the project files (excluding `node_modules` and `dist`).
2. In **Hostinger hPanel**, go to **Websites → Manage → Node.js**:
   - **Node.js Version:** `20.x` or `22.x` (18+ supported)
   - **Application mode:** `Production`
   - **Build command:** `npm run build`
   - **Start command / Application startup file:** `npm start` (or `dist/server.cjs`)
3. Add your environment variables (`DATABASE_URL`, `SESSION_SECRET`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`) in the hPanel Node.js Environment Variables section (or upload your `.env` file to the application root).
4. Click **Deploy / Restart**.

### Option B: Hostinger VPS (Ubuntu + PM2 + Nginx)

1. Clone the repository on your VPS and install dependencies:
   ```bash
   npm ci
   ```
2. Create `.env` from `.env.example` with your production credentials, then build the frontend and server bundle:
   ```bash
   npm run build
   ```
3. Start the production server with PM2:
   ```bash
   NODE_ENV=production PORT=3000 pm2 start dist/server.cjs --name trek-forum
   pm2 save
   ```
4. Point Nginx reverse proxy (`proxy_pass http://127.0.0.1:3000;`) to port `3000`.

## Project Structure

```
src/
  App.tsx               Main app shell and routing between views
  components/           UI components (forum, admin, support chat, modals)
  context/              React context providers (language/i18n)
  data/                 Static fallback data
  server/
    app.ts              Express app + all /api routes
    db.ts               PostgreSQL pool + schema initialization
    security.ts         Password hashing (scrypt), session tokens, CORS, rate limiting & headers
    webBrowser.ts       SSRF-hardened URL fetcher for AI browsing
    businessMemory.ts   Institutional RAG memory compiler
server.ts               Production & development server entry point
```
