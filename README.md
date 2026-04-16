# Flashcard Server - NestJS Backend

## Features

✅ **Gmail OAuth 2.0** - Secure authentication  
✅ **JWT Tokens** - Stateless API authentication  
✅ **PostgreSQL + Prisma** - Type-safe database ORM  
✅ **Spaced Repetition** - SM-2 algorithm implementation  
✅ **RESTful API** - Clean, well-organized endpoints  
✅ **CORS Enabled** - Browser extension support  

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/flashcard"

# JWT
JWT_SECRET="your-secret-key-change-this"
JWT_EXPIRATION="24h"

# Port
PORT=3000

# OAuth (from Google Cloud)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# CORS
EXTENSION_ORIGIN="chrome-extension://YOUR_EXTENSION_ID"
```

### Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Create/update database
npx prisma db push

# (Optional) Create migration
npx prisma migrate dev --name init

# View data in browser
npx prisma studio
```

### Running

```bash
# Development with watch
npm run start:dev

# Production
npm run build
npm start

# Debug mode
npm run start:debug
```

Server listens on `http://localhost:3000`

## 📚 API Routes

### Auth Routes (`/auth`)

```http
POST /auth/google
Content-Type: application/json

{
  "email": "user@gmail.com",
  "googleId": "google-oauth-id",
  "name": "User Name",
  "picture": "https://..."
}

Response:
{
  "id": "user-id",
  "email": "user@gmail.com",
  "name": "User Name",
  "picture": "https://...",
  "access_token": "jwt-token"
}
```

```http
GET /auth/me
Authorization: Bearer {jwt-token}
```

### Flashcard Routes (`/flashcards`)

```http
# Create
POST /flashcards
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "front": "What is capital of France?",
  "back": "Paris",
  "deckId": "optional-deck-id"
}

# Get all
GET /flashcards?deckId=optional

# Get due cards (for review)
GET /flashcards/due?limit=20

# Get stats
GET /flashcards/stats

# Get single
GET /flashcards/{id}

# Update
PUT /flashcards/{id}
{ "front": "...", "back": "..." }

# Delete
DELETE /flashcards/{id}
```

### Review Routes (`/reviews`)

```http
# Submit review
POST /reviews
{
  "flashcardId": "card-id",
  "quality": 4  # 0-5 score
}

# Get review history
GET /reviews/history/{flashcardId}

# Get today's stats
GET /reviews/stats/today
```

### Deck Routes (`/decks`)

```http
POST /decks
{ "name": "Korean Vocabulary", "description": "..." }

GET /decks
GET /decks/{id}
PUT /decks/{id}
DELETE /decks/{id}
```

## 🧠 SM-2 Algorithm

The server implements the SuperMemo 2 (SM-2) algorithm for optimal spaced repetition.

**Key Variables:**
- `interval`: Days until next review
- `easeFactor`: Difficulty multiplier
- `repetitions`: Successful review count
- `nextReviewDate`: When to review next

**Algorithm:**

```javascript
// Quality (0-5)
if (quality < 3) {
  // Failed - reset
  interval = 1;
  repetitions = 0;
  easeFactor = max(1.3, easeFactor - 0.2);
} else {
  // Success
  easeFactor += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  interval = repetitions === 0 ? 1 : 
             repetitions === 1 ? 3 : 
             round(interval * easeFactor);
  repetitions++;
}
```

## 🔒 Security

- **JWT Verification** on protected routes
- **Password hashing** with bcrypt (ready to implement)
- **CORS** restricted origins
- **Input validation** with class-validator
- **SQL injection prevention** with Prisma

## 📊 Database Schema

See `prisma/schema.prisma` for complete schema.

**Main Tables:**
- `users` - OAuth identity
- `flashcards` - Study cards with SM-2 variables
- `reviews` - Review history
- `decks` - Card collections

## 🧪 Testing

```bash
npm test
npm run test:watch
npm run test:cov
```

## 🚢 Deployment

### Vercel

```bash
npm run build
```

### Railway / Heroku

```bash
# Ensure build works
npm run build
npm start
```

Environment variables must be set on hosting platform.

## 📝 Project Structure

```
src/
├── auth/                 # Gmail OAuth + JWT
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   └── auth.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── auth.module.ts
├── flashcard/            # Card management
│   ├── flashcard.controller.ts
│   ├── flashcard.service.ts
│   ├── dto/
│   │   └── flashcard.dto.ts
│   └── flashcard.module.ts
├── review/               # Spaced repetition
│   ├── review.controller.ts
│   ├── review.service.ts  # SM-2 Logic
│   ├── dto/
│   │   └── review.dto.ts
│   └── review.module.ts
├── deck/                 # Collections
│   ├── deck.controller.ts
│   ├── deck.service.ts
│   ├── dto/
│   │   └── deck.dto.ts
│   └── deck.module.ts
├── prisma/               # ORM
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.module.ts
└── main.ts
```

## 🔗 Useful Commands

```bash
# Prisma
npx prisma generate       # Generate client
npx prisma migrate dev    # Create migration
npx prisma studio        # View database
npx prisma reset         # Reset database

# Development
npm run lint             # ESLint
npm run format           # Prettier
npm run test            # Jest tests
```

## 📦 Dependencies

- `@nestjs/*` - NestJS framework
- `@prisma/client` - Database ORM
- `@nestjs/jwt` - JWT authentication
- `passport` - Authentication middleware
- `google-auth-library` - Google OAuth

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests and lint
4. Submit pull request

---

**Built with ❤️ using NestJS**
