# Skill Exchange Platform — Frontend

A hackathon-ready React frontend for the peer-to-peer skill exchange platform.

---

## 🚀 How to Run

### 1. Prerequisites
- Node.js v16+
- Backend running at `http://localhost:5000`

### 2. Install dependencies
```bash
cd skill-exchange-frontend
npm install
```

### 3. Configure environment
Edit `.env` if your backend runs on a different port:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start the app
```bash
npm start
```

Runs at: `http://localhost:3000`

---

## 📁 Project Structure

```
skill-exchange-frontend/
├── public/
│   └── index.html
├── src/
│   ├── index.js              # Entry point
│   ├── index.css             # Global design system (CSS variables, utilities)
│   ├── App.js                # Routes + layout
│   ├── context/
│   │   └── AuthContext.js    # Global auth state (JWT + user)
│   ├── services/
│   │   └── api.js            # Axios instance + all API calls
│   ├── components/
│   │   ├── Navbar.js/css     # Navigation bar
│   │   ├── SkillCard.js      # Skill listing card
│   │   ├── UserCard.js       # User profile card with match score
│   │   ├── RequestCard.js    # Exchange request card
│   │   ├── ReviewCard.js     # Review display card
│   │   ├── SendRequestModal.js # Modal to send an exchange request
│   │   ├── Components.css    # All component styles
│   │   └── Modal.css         # Modal overlay styles
│   └── pages/
│       ├── Login.js/Auth.css      # Login page
│       ├── Register.js            # Register page
│       ├── Dashboard.js/css       # Main dashboard with stats
│       ├── Profile.js/css         # Own profile + edit form
│       ├── UserProfile.js         # View another user's profile
│       ├── Skills.js              # Browse + create skill listings
│       ├── Matches.js/css         # LMS-ranked user matching
│       ├── Requests.js            # Manage exchange requests
│       ├── Sessions.js/css        # Schedule sessions (React Calendar + Meet)
│       ├── Reviews.js/css         # View and write reviews
│       ├── Chat.js/css            # Real-time Socket.IO chat
│       └── Pages.css              # Shared page styles (tabs, filters)
├── .env
└── package.json
```

---

## 🎨 Design System

**Theme:** Dark navy + amber gold accent
- Font pair: `Syne` (headings) + `DM Sans` (body)
- Colors defined as CSS variables in `index.css`
- All components use utility classes: `.btn`, `.card`, `.badge`, `.skill-tag`, etc.

---

## 📄 Pages & Features

| Page | Route | Features |
|------|-------|----------|
| Login | `/login` | JWT auth, demo credentials shown |
| Register | `/register` | Signup with skills to teach/learn |
| Dashboard | `/dashboard` | Stats, recent requests, upcoming sessions, skill overview |
| Profile | `/profile` | View + edit own profile and skills |
| User Profile | `/users/:id` | View any user's profile, send exchange request |
| Skills | `/skills` | Browse all listings, create/delete own listings |
| Matches | `/matches` | LMS-ranked best matches with score display |
| Requests | `/requests` | Accept/reject received, view sent requests |
| Sessions | `/sessions` | Schedule with React Calendar + Google Meet link |
| Reviews | `/reviews` | Star-rating reviews for completed sessions |
| Chat | `/chat/:exchangeId` | Real-time Socket.IO chat per exchange |

---

## 🔌 Real-time Chat

- Connects via Socket.IO on page load
- Each exchange has its own chat room
- Typing indicators with animated dots
- Falls back to REST API if Socket.IO is unavailable
- Messages saved to MongoDB via backend

---

## 📅 Session Scheduling

- React Calendar for date picking
- Time picker input
- Google Meet link field (required for session link)
- Duration selector (30/45/60/90/120 min)
- Shows scheduled sessions with join links

---

## 🧠 LMS Matching Display

- `/matches` page shows users ranked by match score
- Top match gets a highlighted hero card
- Score shown on every user card
- Explanation banner explains the scoring logic
- Search by skill also available

---

## 🔑 Auth Flow

1. Register or Login → JWT stored in localStorage
2. All API calls automatically include `Authorization: Bearer <token>`
3. 401 responses auto-redirect to login
4. Auth state available app-wide via `useAuth()` hook
