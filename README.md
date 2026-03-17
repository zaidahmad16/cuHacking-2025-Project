# ShelterMatch Ottawa

A modern shelter discovery platform for Ottawa — swipe through shelters, filter by your needs, and find the right fit. Built with a glassmorphism dark UI and smooth drag-to-swipe interactions.

Built for **cuHacking 2025**.

## Features

- **Swipe-to-Match Interface** — Drag cards left to skip, right to save, with animated SAVE/SKIP stamps and spring physics
- **Smart Filtering** — Filter shelters by gender, religion, race/background, and services/interests
- **15 Ottawa Shelters** — Real Ottawa shelters with capacity, hours, phone, amenities, and demographic data
- **Auth System** — Email/password registration and login
- **Saved Shelters** — View, call, get directions, or remove saved shelters
- **Detail Sheets** — Tap any card for full info, directions (Google Maps), and one-tap calling
- **Bed Availability** — Color-coded status indicators (green/yellow/red)
- **Dark Glassmorphism UI** — Animated gradients, glow effects, frosted-glass cards

## Team Members

- Zaid Ahmad
- Vinit Rao
- Jordan Yang
- Evan Schincariol

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Framer Motion, Lucide React |
| **Styling** | Tailwind CSS 4 + custom CSS (glassmorphism, animations) |
| **Backend** | Node.js + Express |
| **Database** | JSON file storage (`data/` directory — zero setup) |

## Project Structure

```
├── server.js              # Express API server (port 5000)
├── data/
│   ├── shelters.json      # 15 Ottawa shelters with full metadata
│   ├── users.json         # Registered users
│   └── swipes.json        # Swipe history
├── frontend/              # Next.js app
│   ├── app/
│   │   ├── layout.js      # Root layout with fonts
│   │   ├── page.js        # All UI components (auth, swipe, saved, filters)
│   │   └── globals.css    # Dark theme, glassmorphism, animations
│   └── package.json
└── package.json           # Root package (backend deps)
```

## Quick Start

### 1. Install Dependencies

```bash
# Backend deps (from project root)
npm install

# Frontend deps
cd frontend
npm install
```

### 2. Start Backend Server

```bash
node server.js
```

Runs on **http://localhost:5000**

### 3. Start Frontend (new terminal)

```bash
cd frontend
npm run dev
```

Opens at **http://localhost:3000**

### 4. Use the App

1. Register a new account or log in
2. Swipe right (or tap ❤️) to save a shelter
3. Swipe left (or tap ✕) to skip
4. Use the filter button to narrow by gender, religion, race, or services
5. Tap a card to see full details, get directions, or call

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | Register (email, password, name) |
| `POST` | `/auth/login` | Login (email, password) |
| `GET` | `/shelters` | List shelters (supports `?gender=`, `?religion=`, `?demographics=`, `?interests=` query params) |
| `GET` | `/shelters/:id` | Single shelter |
| `POST` | `/swipe-right` | Save a shelter (userId, shelterId) |
| `POST` | `/swipe-left` | Skip a shelter (userId, shelterId) |
| `GET` | `/saved-shelters?userId=` | Get saved shelters |
| `DELETE` | `/saved-shelters/:id?userId=` | Remove saved shelter |

## Deployment

### Frontend → Vercel (free)

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Vercel auto-detects Next.js — deploy

### Backend → Railway (free)

1. Create project at [railway.app](https://railway.app)
2. Deploy from GitHub
3. Set start command: `node server.js`
4. Update the `API` constant in `frontend/app/page.js` to your Railway URL

### Option 4: Expo Application Services (Mobile)

For publishing to App Store / Google Play:
```bash
npm install -g eas-cli
eas login
eas build --platform all
eas submit
```

---

## Project Structure
```
├── App.js              # Main app with Tinder swipes
├── ProfileScreen.js    # Saved shelters view  
├── server.js           # Express backend API
├── data/               # JSON database
│   ├── shelters.json   # Ottawa shelters
│   ├── users.json      # User accounts
│   └── swipes.json     # Swipe history
└── package.json        # Dependencies
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login |
| GET | `/shelters` | All Ottawa shelters |
| POST | `/swipe-right` | Save a shelter |
| POST | `/swipe-left` | Skip a shelter |
| GET | `/saved-shelters` | User's saved list |
| DELETE | `/saved-shelters/:id` | Remove saved |

## Ottawa Shelters
- Ottawa Mission (Men)
- Shepherds of Good Hope (All)
- Cornerstone Housing for Women
- Salvation Army Booth Centre (Men)
- Youth Services Bureau (16-24)
- Union Mission (All)

## Environment Variables (for deployment)
```
PORT=5000
```

## Troubleshooting

**Config error on localhost:8081:**
- Make sure backend is running first: `npm run backend`
- Then start frontend: `npm run web`

**"Could not load shelters":**
- Backend not running - start it with `npm run backend`

**Can't login:**
- Use demo: demo@test.com / demo123
- Or register a new account
