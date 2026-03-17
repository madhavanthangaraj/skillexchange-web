# Skill Exchange Platform — Backend

A hackathon-ready MERN backend for a peer-to-peer skill exchange marketplace.

---

## 🚀 How to Run

### 1. Prerequisites
- Node.js v16+
- MongoDB running locally (`mongod`) OR MongoDB Atlas URI

### 2. Install dependencies
```bash
cd skill-exchange-backend
npm install
```

### 3. Configure environment
Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/skill-exchange
JWT_SECRET=skill_exchange_jwt_secret_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. (Optional) Seed sample data
```bash
npm run seed
```
Creates 4 test users with skills and listings. Credentials:
- `alice@example.com` / `password123`
- `bob@example.com` / `password123`
- `carol@example.com` / `password123`
- `david@example.com` / `password123`

### 5. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## 📁 Folder Structure

```
skill-exchange-backend/
├── server.js              # Entry point
├── .env                   # Environment variables
├── package.json
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js            # User + skills to teach/learn
│   ├── Skill.js           # Skill listings
│   ├── ExchangeRequest.js # Exchange requests
│   ├── Session.js         # Scheduled sessions + Meet link
│   ├── Review.js          # Post-session reviews
│   └── Message.js         # Chat messages
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── skillController.js
│   ├── exchangeController.js
│   ├── sessionController.js
│   ├── reviewController.js
│   └── chatController.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── skillRoutes.js
│   ├── exchangeRoutes.js
│   ├── sessionRoutes.js
│   ├── reviewRoutes.js
│   └── chatRoutes.js
├── middleware/
│   ├── auth.js            # JWT protect middleware
│   └── errorHandler.js    # Global error handler
├── utils/
│   ├── generateToken.js   # JWT token generator
│   ├── matchingEngine.js  # LMS skill matching logic
│   └── seeder.js          # Sample data seeder
└── sockets/
    └── chatSocket.js      # Socket.IO real-time chat
```

---

## 📡 API Reference

All protected routes require header:
```
Authorization: Bearer <token>
```

---

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Private | Get current user |

---

### Users
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/users` | Private | Get all users |
| GET | `/api/users/matches` | Private | LMS-ranked matches |
| GET | `/api/users/search?skill=React` | Private | Search by skill |
| GET | `/api/users/:id` | Private | Get user by ID |
| PUT | `/api/users/profile` | Private | Update own profile |

---

### Skills
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/skills` | Private | All skill listings |
| POST | `/api/skills` | Private | Create listing |
| GET | `/api/skills/my` | Private | My listings |
| GET | `/api/skills/:id` | Private | Skill by ID |
| PUT | `/api/skills/:id` | Private | Update skill |
| DELETE | `/api/skills/:id` | Private | Delete skill |

---

### Exchange Requests
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/exchange` | Private | Send request |
| GET | `/api/exchange` | Private | My sent + received |
| GET | `/api/exchange/:id` | Private | Request by ID |
| PUT | `/api/exchange/:id` | Private | Accept / Reject |

**PUT body:** `{ "status": "accepted" }` or `{ "status": "rejected" }`

---

### Sessions
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/sessions` | Private | Schedule session |
| GET | `/api/sessions` | Private | My sessions |
| GET | `/api/sessions/:id` | Private | Session by ID |
| PUT | `/api/sessions/:id` | Private | Update status / meet link |

**POST body example:**
```json
{
  "exchangeRequestId": "<id>",
  "scheduledDate": "2024-08-15",
  "scheduledTime": "10:00 AM",
  "duration": 60,
  "meetLink": "https://meet.google.com/xyz-abc-def",
  "topic": "React Hooks deep dive"
}
```

---

### Reviews
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/reviews` | Private | Add review |
| GET | `/api/reviews/my` | Private | Reviews I wrote |
| GET | `/api/reviews/user/:userId` | Private | Reviews for a user |

---

### Chat (REST fallback)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/chat/:exchangeRequestId` | Private | Chat history |
| POST | `/api/chat/:exchangeRequestId` | Private | Send message |

---

## 🔌 Socket.IO (Real-time Chat)

**Connect:**
```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "<JWT_TOKEN>" }
});
```

**Events to emit (client → server):**
| Event | Payload | Description |
|-------|---------|-------------|
| `joinRoom` | `{ exchangeRequestId }` | Join a chat room |
| `sendMessage` | `{ exchangeRequestId, content }` | Send a message |
| `typing` | `{ exchangeRequestId }` | Typing indicator |
| `stopTyping` | `{ exchangeRequestId }` | Stop typing |
| `leaveRoom` | `{ exchangeRequestId }` | Leave room |

**Events to listen (server → client):**
| Event | Payload | Description |
|-------|---------|-------------|
| `joinedRoom` | `{ exchangeRequestId }` | Confirm room joined |
| `newMessage` | `{ sender, content, createdAt, ... }` | Incoming message |
| `userTyping` | `{ userId, name }` | Someone is typing |
| `userStoppedTyping` | `{ userId }` | Stopped typing |
| `error` | `{ message }` | Error from server |

---

## 🧠 LMS Matching Logic

Located in `utils/matchingEngine.js`.

**Score calculation:**
- +10 points for each skill User A teaches that User B wants to learn
- +10 points for each skill User B teaches that User A wants to learn
- +20 bonus for a full bidirectional match

Users are ranked by score — highest match shown first.

---

## 🛡️ Auth Flow

1. Register → POST `/api/auth/register` → receive JWT
2. Login → POST `/api/auth/login` → receive JWT
3. Send JWT as `Authorization: Bearer <token>` on all protected routes
