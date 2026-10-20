# Hostel Hub

Hostel Hub is a hostel management website. Express serves the HTML, CSS, and JavaScript frontend and provides the API. MySQL stores user and hostel data.

## Run the project

Requirements: Node.js 20+ and MySQL 8 (or compatible).

1. Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `server/.env`.
2. From PowerShell:

   ```powershell
   cd D:\sem5\FSD\project\server
   npm install
   node setup_db.js
   npm run seed
   cd ..\client
   npm install
   npm run dev
   ```

3. Open [http://localhost:5000](http://localhost:5000). Check the API and database at [http://localhost:5000/api/health](http://localhost:5000/api/health).

Express serves the files in `public` directly. No frontend build step is needed.

The server uses `PORT` from `server/.env` and defaults to `5000`. Change that value to any available port if needed.

You can run the dev server from either folder. In `server`, use `npm run dev`; in `client`, use `npm run dev` to forward to the server. Both print the local URL in the terminal, for example `Local: http://localhost:5000/`.

`npm run seed` creates or updates the admin login to `admin@hostelhub.com` / `admin123`. Use this local starter account to sign in, then add student accounts in the admin portal. `setup_db.js` creates missing tables and adds columns needed by newer code while keeping existing rows. The project does not include a demo-data or database-reset command.


## Project map

```text
public/                 HTML, CSS, and browser JavaScript served by Express/Vercel
index.js                Express entry point used by Vercel
server/server.js        Express app, API routes, and static file hosting
server/controllers/     Input checks and feature operations
server/routes/          URL to operation mapping
server/config/db.js     MySQL connection
database/schema.sql     Tables and relationships
```

## Viva explanation

The browser loads one HTML page. `app.js` shows the selected admin or student screen and sends form data with Fetch to Express. Express checks the signed-in user's role and runs parameterized MySQL queries. Passwords are hashed before they are stored. Bootstrap supplies common controls and icons; `theme.css` provides one shared teal-and-black style for both portals, using horizontal cards for records.

The admin portal manages students, rooms and allocations, leaves, visitors, complaints, fees, and notices. The student portal includes dashboard, profile, room, leaves, visitors, complaints, fees, notices, mess, laundry, and lost-and-found.

## Deploy to Vercel

Vercel deploys the Express app from the repository root. The MySQL database must be hosted somewhere reachable from Vercel; a local MySQL server is not reachable by the deployed app.

1. Create a hosted MySQL database, push the repository to GitHub, and import it into Vercel with the repository root as the Root Directory.
2. Add `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` under the Vercel project's Environment Variables. Add a long random `SESSION_SECRET` too. Do not add `server/.env` to Git or paste secrets into source files.
3. Put the hosted database connection values plus `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your local ignored `server/.env`. Run `npm run setup-db` and `npm run seed` from the repository root once to create the schema and admin account in the hosted database.
4. Deploy. Check `/api/health` on the Vercel URL; it should report that the database is connected.

The project uses signed 12-hour session tokens so API sign-in works across Vercel function instances. Set the same `SESSION_SECRET` in every deployment environment where users should remain signed in.

## Deploy to Render

The root `render.yaml` configures one Node web service for the Express app. Render does not provide a managed MySQL database, so create one with an external MySQL provider first. In Render, create a Blueprint from this repository's `main` branch and supply the hosted database values when prompted. Render generates `SESSION_SECRET` automatically. Set the hosted DB values and `ADMIN_EMAIL` / `ADMIN_PASSWORD` in your local ignored `server/.env`, then run `npm run setup-db` and `npm run seed` from the repository root to initialize that database. The service health check is `/api/health`.
