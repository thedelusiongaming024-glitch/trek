# Ama Community

A community discussion forum and support center: topics and threaded replies, an
admin panel, a knowledge base, and an AI support assistant backed by Gemini and a
Postgres-stored FAQ/knowledge base. Frontend is React + Vite + Tailwind; the API is
a single Express app shared between local dev and Vercel serverless functions.

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **API:** Express (`src/server/app.ts`), deployed as a Vercel serverless function (`api/index.ts`)
- **Database:** Neon Postgres, via `@neondatabase/serverless`
- **AI:** Google Gemini (`@google/genai`), used for the support chat and admin knowledge-doc extraction

## Local development

**Prerequisites:** Node.js 18+, a Neon Postgres database.

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — your Neon connection string
   - `GEMINI_API_KEY` — for the AI support assistant and knowledge extraction
3. Run the app:
   ```
   npm run dev
   ```
   This starts Express with Vite in middleware mode on `http://localhost:3000`. Tables
   are created automatically on first run.

## Deploying to Vercel

The project is already configured for Vercel — see `vercel.json`. In short:

1. Import the repo in Vercel.
2. Set `DATABASE_URL` and `GEMINI_API_KEY` as environment variables.
3. Deploy. Vercel runs `vite build` for the frontend and routes `/api/*` to the
   serverless function in `api/index.ts`, which wraps the same Express app used locally.

## Project structure

```
src/
  App.tsx               Main app shell and routing between views
  components/            UI components (forum, admin, support chat, modals)
  context/                React context providers (language/i18n)
  data/                   Static/mock fallback data
  server/
    app.ts                Express app + all /api routes (shared by dev and Vercel)
    db.ts                 Postgres pool + schema init/seed
api/
  index.ts                Vercel serverless entry point
server.ts                 Local dev entry point (Express + Vite middleware)
```
