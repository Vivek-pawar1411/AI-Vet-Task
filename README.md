# AV Vet — AI Vet & Pet Management Platform

AV Vet is a MERN-style web application for pet owners. It provides account registration, pet profiles, appointment scheduling, prescription/health-record tracking, and an informational AI assistant powered through server-side OpenRouter or NVIDIA NIM API calls.

> The AI assistant provides general information only. It is not a veterinarian, cannot diagnose or prescribe, and must not be used for emergencies.

## Requirements

- Node.js 20 or newer and npm
- MongoDB Community Server running locally, or a MongoDB Atlas database
- An OpenRouter and/or NVIDIA NIM API key for the corresponding AI provider feature
- A modern browser

MongoDB is required for account and pet data. AI provider keys are optional until you use that provider.

## Project layout

```text
client/
  src/
    components/
      AssistantPage.jsx       AI provider/model selection and assistant
      AuthPage.jsx            Sign-up and login
      Dashboard.jsx           Counts, pet summary, upcoming visit
      ManagementPages.jsx     Pet, appointment, and health-record screens/forms
      Modal.jsx               Reusable dialog
    context/
      AuthContext.jsx         Current-user/session state
    lib/
      api.js                  Axios API client and error messages
    App.jsx                   Navigation, protected app shell and routes
    main.jsx                  React entry point
    styles.css                Tailwind directives and responsive styles
  .env.example
  index.html
  package.json
  tailwind.config.js
  vite.config.js
server/
  src/
    config/db.js              Mongoose connection
    controllers/              Authentication, CRUD and AI handlers
    middleware/               Session auth, origin check, error handler
    models/                    User, Pet, Appointment, Prescription schemas
    routes/                    Express API routers
    utils/                     Async handler, application error, field picker
    app.js                     Express/CORS/security/API configuration
    server.js                  Environment loading and startup
  .env.example
  package.json
```

## Local setup (Windows PowerShell)

Open two terminals in the project directory.

### 1. Configure the backend

In the first terminal:

```powershell
cd "C:\Users\YOUR_NAME\path\to\AI Vet Task\server"
Copy-Item .env.example .env
notepad .env
```

In `server/.env`, set `MONGODB_URI` to your own MongoDB connection string. For a local MongoDB server, the default is:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ai-vet
```

Generate a new JWT secret in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Put the generated value on the `JWT_SECRET=` line in `server/.env`. Add provider keys only if you intend to use those AI providers. Save the file. Do not copy real credentials into the example file, frontend environment, source code, or chat messages.

Install and start the API:

```powershell
npm install
npm run dev
```

Expected startup messages include `Connected to MongoDB` and `AI Vet API listening on port 5000`. Check the health endpoint in a terminal:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Expected result: `status` is `ok`. MongoDB creates the database and collections when the application first writes records.

### 2. Configure and start the client

In the second terminal:

```powershell
cd "C:\Users\YOUR_NAME\path\to\AI Vet Task\client"
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The Vite development server proxies `/api` requests to `http://localhost:5000`. If the API uses a different address, update the proxy in `client/vite.config.js` and restart Vite.

### 3. First account

There are no seeded/demo accounts. Use **Create an account** in the app to create your own account, then sign in. Passwords must be at least 8 characters. Use fictional data for demonstrations.

## Using the application

1. **Overview:** Shows your pet count, upcoming appointments, health-record count, pet summary and next visit.
2. **My pets:** Add, edit and remove pet profiles. Species choices are Dog, Cat, Bird, Rabbit and Other. Age is in years and weight is in kilograms. Notes can include non-sensitive care context.
3. **Appointments:** Select one of your pets, enter the clinic, date/time and visit reason. New appointments start as `scheduled`. The database/API supports `scheduled`, `confirmed`, `completed` and `cancelled`; the current appointment form does not include a status selector.
4. **Health records:** Store a medication or record title, dosage/summary, prescriber, date, optional expiry and instructions. This is a simple record-keeping form, not a medical prescription service.
5. **AI care assistant:** Choose OpenRouter or NVIDIA NIM, refresh the provider model catalog, choose a listed model, optionally select a pet, enter a question/symptoms, then submit. OpenRouter is filtered to catalog-listed free models and includes its free auto-router; NVIDIA models are drawn from the provider catalog. The UI shows at most two catalog models in addition to the OpenRouter auto-router. Catalog listing does not guarantee that a model will always respond: provider access, rate limits and availability can change. Refresh does not send a test prompt.

The AI assistant sends the question and selected pet context to the chosen provider. Do not enter sensitive personal information. For urgent symptoms (breathing difficulty, collapse, seizures, suspected poisoning), contact an emergency veterinarian rather than using the assistant.

## Safe dummy data for a walkthrough

These are examples only. Do not use a real person's password or private medical information.

### Sign up / sign in

```text
Name: Jamie Example
Email: jamie.example@example.com
Password: DemoPass!2026
```

Create this account through the sign-up screen first. Then use the same email/password on the sign-in screen. This account is not pre-created.

### Pet profile

```text
Name: Maple
Species: Dog
Breed: Mixed breed
Age: 4
Weight (kg): 18
Medical notes: Demo only. No known allergies reported.
```

### Appointment

```text
Pet: Maple
Clinic name: Example Veterinary Clinic
Clinic address: 100 Sample Road, Example City
Date and time: Choose a future date/time in the form
Reason for visit: Routine wellness check (demo)
Status: Scheduled (assigned by the app)
```

### Health record

```text
Pet: Maple
Medication / record title: Annual wellness visit (demo)
Dosage / summary: Routine check-up record
Prescribed by: Dr. Example
Date: Choose a date
Expires on: Leave blank for this demo
Instructions / notes: Demo record only; not a real prescription.
```

### AI assistant sample prompt

Select Maple and a model listed by the provider, then submit this clearly fictional test question:

```text
This is a fictional test question, not a real emergency. Maple sneezed twice
today, is eating and drinking normally, and is acting as usual. What general
signs should an owner monitor, and when should they contact a veterinarian?
```

## Environment variables

See `server/.env.example` and `client/.env.example` for templates. Never commit or share the real `.env` files.

| Variable | Used by | Purpose |
|---|---|---|
| `NODE_ENV` | Server | `development` or `production`; production cookies use the secure flag |
| `PORT` | Server | API port; default `5000` |
| `CLIENT_URL` | Server | Allowed client origin for CORS and OpenRouter metadata |
| `MONGODB_URI` | Server | Local or hosted MongoDB connection URI |
| `JWT_SECRET` | Server | Random signing key; must be at least 32 characters |
| `JWT_EXPIRES_IN` | Server | Session-token lifetime; default `7d` |
| `OPENROUTER_API_KEY` | Server | OpenRouter secret (optional until OpenRouter is used) |
| `OPENROUTER_BASE_URL` | Server | Defaults to `https://openrouter.ai/api/v1` |
| `NVIDIA_API_KEY` | Server | NVIDIA NIM secret (optional until NVIDIA is used) |
| `NVIDIA_BASE_URL` | Server | Defaults to `https://integrate.api.nvidia.com/v1` |
| `VITE_API_URL` | Client | API base URL including `/api`; defaults to the same-origin `/api` |

Never put provider credentials in `client/.env` or a `VITE_*` variable: Vite variables are delivered to the browser. If a key or JWT secret is accidentally shared, revoke/rotate it.

## API reference

Authentication uses an HttpOnly `session` cookie. All pet, appointment, prescription, and AI routes require a signed-in user. Records are owner-scoped.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/signup` | Create account and session |
| `POST` | `/api/auth/login` | Sign in and create session |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Current signed-in user |
| `GET`, `POST` | `/api/pets` | List or create pets |
| `PATCH`, `DELETE` | `/api/pets/:id` | Update or remove a pet |
| `GET`, `POST` | `/api/appointments` | List or schedule appointments |
| `PATCH`, `DELETE` | `/api/appointments/:id` | Update or delete appointment |
| `GET`, `POST` | `/api/prescriptions` | List or add health records |
| `PATCH`, `DELETE` | `/api/prescriptions/:id` | Update or delete health record |
| `GET` | `/api/ai/models/:provider` | Read model catalog (`openrouter` or `nvidia`) |
| `POST` | `/api/ai/chat` | Send a chat request through the selected provider |

## Technology

- **Client:** React 18, Vite, React Router, Tailwind CSS, Lucide React, Axios
- **Server:** Node.js ES modules, Express, Mongoose, Axios
- **Database:** MongoDB
- **Auth/security:** bcryptjs password hashing, JWT in an HttpOnly cookie, Helmet, credentialed CORS, same-origin check, express-rate-limit
- **AI:** OpenAI-compatible chat-completion proxy for OpenRouter and NVIDIA NIM; secrets stay on the server

## Checks and production notes

```powershell
# Client production build
cd client
npm run build

# Backend entry-point syntax check
cd ..\server
npm run check
```

## Deploy to Render and Vercel

Deploy the backend to Render as a **Web Service** with `server` as the Root Directory, `npm install` as the build command, and `npm start` as the start command. Set these environment variables in the Render service:

- `MONGODB_URI`: a MongoDB Atlas connection string. Create a database user and allow the Render service to connect in Atlas Network Access.
- `JWT_SECRET`: a unique random value of at least 32 characters. Generate one locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `NODE_ENV=production`
- `CLIENT_URL=https://ai-vet-task.vercel.app` (the frontend origin).
- Optional: `OPENROUTER_API_KEY` and/or `NVIDIA_API_KEY` for the AI assistant.

Deploy the frontend to Vercel with Root Directory `client` or the repository root. Both Vercel configurations proxy `/api/*` to the Render backend. The frontend defaults to the same-origin `/api` path; set `VITE_API_URL` only if you intentionally use a different API base URL. This proxy keeps session cookies same-origin. Verify `https://ai-vet-task-server.onrender.com/health` and `https://ai-vet-task.vercel.app/api/health` both return `{"status":"ok"}`. An unauthenticated request to `/api/auth/me` should return `401`; account creation and sign-in require a reachable MongoDB database.

For production, use HTTPS, a managed MongoDB deployment, a strong unique JWT secret, rotated provider keys, and operational monitoring. This starter is not a substitute for a security/privacy review before handling real owner or animal health data.
