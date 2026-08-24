# Curvature Studio — Hostinger (MySQL + PHP) deployment

The site no longer depends on any hosted backend service. Data lives in **MySQL**,
media lives in a folder on your own hosting, and login is **PHP + JWT** against MySQL.

## What is in this folder

| Path | Purpose |
|---|---|
| `schema.sql` | Full MySQL structure (users, roles, projects, studio, clients, events, registrations, messages, backgrounds) |
| `data.sql` | Your current content, exported and ready to import (53 projects, 6 studio items, 8 clients, background slots) |
| `api/` | The PHP backend: `auth.php`, `query.php`, `upload.php`, `thumb.php`, `lib.php`, `config.example.php`, `.htaccess` |
| `uploads/.htaccess` | Hardening for the media folder (no script execution, long cache) |
| `.htaccess` | Root rules for `public_html` (routing + caching + security headers) |

The actual media files are delivered separately as a ZIP (`uploads/` + both SQL files),
because binaries are not stored in the code repository.

## 1) Create the database

1. hPanel → **Databases → MySQL Databases** → create a database and a user, note the credentials.
2. Open **phpMyAdmin** for that database → **Import** → upload `schema.sql` → run.
3. Import `data.sql` the same way (it must run **after** `schema.sql`).

## 2) Upload the files

In `public_html`:

```
public_html/
├── index.html + assets/      ← built frontend
├── .htaccess                 ← hostinger/.htaccess
├── api/                      ← hostinger/api/
└── uploads/                  ← media files from the ZIP (plus uploads/.htaccess)
```

Make `uploads/` writable (permissions `755`).

## 3) Configure the API

1. Copy `api/config.example.php` to `api/config.local.php`.
2. Fill in: database name/user/password, a long random `JWT_SECRET`, and `ALLOWED_ORIGINS`
   (your domain, e.g. `https://curvaturestudio.com`).
3. Keep `UPLOAD_DIR` pointing at the real path of `public_html/uploads` and
   `UPLOAD_URL` at `/uploads`.

`config.local.php`, `config.example.php` and `lib.php` are blocked from direct
browser access by `api/.htaccess`.

## 4) Create the employee account

With `ALLOW_SIGNUP` temporarily set to `true` in `config.local.php`, open the site's
`/auth` page and create the account (`info@curvaturestudio.com`). The **first** account
created is automatically granted the employee role. Then set `ALLOW_SIGNUP` back to
`false` so nobody else can register.

## 5) Build the frontend (static production build)

```bash
npm install
node hostinger/make-static.mjs
```

This produces `dist/client/` (including `index.html`) — a fully static bundle.
Upload **the contents of `dist/client`** into `public_html`, next to `api/`,
`uploads/` and `.htaccess`. If the API lives on another domain, set
`VITE_API_BASE_URL=https://your-domain.com/api` before building; otherwise the
default `/api` (same domain) is used.

> Shared hosting runs PHP only, so the frontend is served as static files and the
> PHP API does all server work. Deep links work because `.htaccess` rewrites every
> unknown path to `index.html`.

## Environment variables

Frontend (build time, `.env` in the project root — no credentials):

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `/api` (same domain) or `https://your-domain.com/api` |

Backend (`api/config.local.php` on the server, or Hostinger env vars — never in the frontend):

| Variable | Purpose |
|---|---|
| `DB_HOST` | usually `localhost` |
| `DB_PORT` | `3306` |
| `DB_NAME` / `DB_USER` / `DB_PASS` | MySQL credentials from hPanel |
| `JWT_SECRET` | long random string (`php -r "echo bin2hex(random_bytes(32));"`) |
| `UPLOAD_DIR` / `UPLOAD_URL` | absolute path of `public_html/uploads` and `/uploads` |
| `MAX_UPLOAD` | max upload size in bytes (default 52428800) |
| `CORS_ORIGIN` | empty for same domain |
| `ALLOW_SIGNUP` | `false` in production |

## No Supabase

The project contains **zero** Supabase code, packages, imports or environment
variables: the client library was uninstalled, `src/integrations/supabase/` and
`supabase/` were deleted, and all data/auth/storage/upload calls go through
`src/lib/db.ts` → `/api/*.php` → MySQL. A browser test of the production build
recorded no network request to any Supabase host.


## Security notes

- Passwords are hashed with `password_hash()` (bcrypt); only a signed JWT is stored in the browser.
- `query.php` whitelists tables and columns, and unauthenticated visitors can only read
  published rows and can only insert contact messages / event registrations.
- The service credentials never leave the server: the browser only ever talks to `/api`.
- Uploads are limited to 50 MB and to image/video extensions; the uploads folder cannot execute scripts.
- Always serve the site over HTTPS (hPanel → SSL) so tokens are not sent in clear text.

## Media URLs

Old stored links are rewritten automatically to `/uploads/<file>` by the frontend,
so imported content keeps working. Externally hosted images (e.g. the archive gallery)
stay on their original URLs.

## Employee login

After importing `schema.sql` (and `data.sql`), import `seed-user.sql` to create the dashboard account:

- Email: info@curvaturestudio.com
- Password: curvaturestudio3889

Change the password later by re-running `seed-user.sql` with a new bcrypt hash.
Note: the PHP API only runs on Hostinger — login cannot work inside the Lovable preview.
