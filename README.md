# CareerHub - Job Application Form

A full-stack job application form with **client-side and server-side validation**.
The server never trusts the frontend: every rule is checked again on the backend.

**Stack:** React (Vite) + Tailwind CSS, Node.js + Express, MongoDB (native driver)

## Project structure
- `client/` - React frontend
- `server/` - Express backend (single `index.js`)

## Form fields
| Field | Type | Rules |
|---|---|---|
| Full Name | text | required, 3-60 chars, letters/space/dot/hyphen/apostrophe |
| Email | email | required, valid format |
| Phone | text | required, international number with country code (`+8801712345678`) or local number starting with `0` |
| Applying For | dropdown | required, must be from the position list |
| Available From | date | required, not in the past, within 12 months |
| Resume | file | required, PDF/DOC/DOCX, max 5MB, file content is verified |
| Why are you applying? | textarea | required, 20-500 chars |

## API
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/applications` | none | Submit application (`multipart/form-data`) |
| GET | `/applications` | `x-admin-key` | List applications (without file data) |
| GET | `/applications/:id` | `x-admin-key` | Application details |
| GET | `/applications/:id/resume` | `x-admin-key` | Download resume |

**Success:** `201 { message, applicationId }`

**Validation error:** `400 { error: "Validation failed", errors: { fieldName: "message" } }`

**Duplicate (same email + position):** `409 { error, errors: { email } }`

Resume files are stored inside MongoDB (Buffer), so nothing is lost on redeploy.

## Environment variables
`server/.env`
```
PORT=5000
CLIENT_URL=http://localhost:5173
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
ADMIN_KEY=your_long_random_admin_key
```
`client/.env.local`
```
VITE_API_URL=http://localhost:5000
```
`CLIENT_URL` accepts multiple origins separated by commas.

## Run locally
```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```
Requires Node.js 20.19 or newer.

## Deployment notes
- MongoDB Atlas: allow `0.0.0.0/0` in Network Access, use a user with `readWrite` on `careerhubDB` only.
- Backend host: set `DB_USER`, `DB_PASS`, `ADMIN_KEY`, `CLIENT_URL` (the deployed frontend URL, no trailing slash). Start command: `npm start`.
- Frontend host: set `VITE_API_URL` to the deployed backend URL.