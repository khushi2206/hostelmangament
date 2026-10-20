# HostelHub

HostelHub is a React/Vite client with an Express API and MySQL database.

## Prerequisites

- Node.js 18 or newer
- MySQL 8 or a compatible MySQL server

## Configure and start

1. Check the values in `server/.env` and set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `JWT_SECRET` for your MySQL setup.
2. Create the database tables from the project root:

   ```powershell
   cd server
   npm install
   node setup_db.js
   npm run seed
   ```

   `npm run seed` creates the initial admin account `admin@hostelhub.com` with password `admin123` (and resets that account's password if it already exists). You can add student accounts from the admin portal. `npm run seed:demo` is optional and **deletes existing application data** before loading demo data; use it only on a database you are willing to reset.
3. In another terminal, start the API:

   ```powershell
   cd server
   npm start
   ```

4. In a third terminal, start the client:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

Open the URL printed by Vite. Its `/api` requests are proxied to the API at `http://localhost:5000`. Set `VITE_API_PROXY_TARGET` if the API runs elsewhere. `GET http://localhost:5000/api/health` reports whether both the API and MySQL are reachable.

For a production client build, run `npm run build` from `client`.
