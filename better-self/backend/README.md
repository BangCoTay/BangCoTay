# Better-Self (Resetify) Backend API

Production-ready NestJS backend for the Better-Self addiction recovery application.

## 🚀 Features

- **Authentication**: Supabase Auth with JWT tokens
- **User Management**: Profile management and subscription tracking
- **30-Day Plans**: Server-side plan generation with tier-based unlocking
- **Task Management**: Task completion tracking with streak calculation
- **AI Coach**: Real OpenAI integration (GPT-4 for premium, GPT-3.5 for free/starter)
- **Motivational Quotes**: Personalized quote generation with regeneration limits
- **Payments**: Stripe integration for subscriptions
- **Data Migration**: Import localStorage data from frontend-only version
- **Security**: Rate limiting, CORS, input validation, audit logging

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (for payments)
- OpenAI API key (for AI chat)

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_supabase_jwt_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PREMIUM=price_...

# OpenAI
OPENAI_API_KEY=sk-...

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the database schema from `database-schema.sql`
4. This will create all tables, indexes, RLS policies, and triggers

### 4. Configure Stripe

1. Create products in Stripe Dashboard:
   - **Starter Plan**: $9.99/month
   - **Premium Plan**: $19.99/month
2. Copy the price IDs to your `.env` file
3. Set up webhook endpoint: `https://your-api.com/api/v1/payments/webhook`
4. Copy webhook secret to `.env`

### 5. Run the Application

**Development:**
```bash
npm run start:dev
```

**Production:**
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api/v1`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/v1/auth/signup`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "user": { ... },
  "session": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "..."
}
```

#### POST `/api/v1/auth/login`
Login existing user.

#### POST `/api/v1/auth/refresh`
Refresh access token.

#### POST `/api/v1/auth/logout`
Logout user.

#### GET `/api/v1/auth/me`
Get current user info.

### User Endpoints

#### GET `/api/v1/users/profile`
Get user profile.

#### PUT `/api/v1/users/profile`
Update user profile.

#### GET `/api/v1/users/subscription`
Get subscription details.

### Onboarding Endpoints

#### POST `/api/v1/onboarding`
Submit onboarding data.

**Request:**
```json
{
  "niche": "digital",
  "addiction": "social-media",
  "severity": "moderate",
  "painPoints": ["time", "energy"],
  "healthyHabit": "reading"
}
```

#### GET `/api/v1/onboarding`
Get user's onboarding data.

### Plans Endpoints

#### POST `/api/v1/plans/generate`
Generate 30-day plan based on onboarding data.

#### GET `/api/v1/plans/current`
Get current active plan with all day plans and tasks.

#### GET `/api/v1/plans/:planId/day/:dayNumber`
Get specific day plan.

### Tasks Endpoints

#### GET `/api/v1/tasks`
Get tasks (with optional filters).

Query params:
- `dayNumber`: Filter by day
- `completed`: Filter by completion status

#### POST `/api/v1/tasks/:taskId/complete`
Mark task as completed.

**Response:**
```json
{
  "task": { ... },
  "progress": {
    "totalTasksCompleted": 15,
    "streakDays": 5
  },
  "streakUpdated": true,
  "celebrationMessage": "🎉 Amazing! You completed all tasks for today!"
}
```

#### POST `/api/v1/tasks/:taskId/uncomplete`
Mark task as incomplete.

### Progress Endpoints

#### GET `/api/v1/progress`
Get user progress summary.

**Response:**
```json
{
  "currentDay": 5,
  "totalTasksCompleted": 15,
  "streakDays": 5,
  "completionRate": 75,
  "aiMessagesUsed": 2,
  "quoteRegenerations": 1
}
```

#### GET `/api/v1/progress/analytics`
Get detailed analytics.

### Chat Endpoints

#### POST `/api/v1/chat/messages`
Send message to AI coach.

**Request:**
```json
{
  "content": "I'm struggling with cravings today",
  "coachPersona": "Alex"
}
```

**Response:**
```json
{
  "userMessage": { ... },
  "assistantMessage": {
    "content": "I understand...",
    "model": "gpt-3.5-turbo"
  },
  "messagesRemaining": 1
}
```

#### GET `/api/v1/chat/messages`
Get chat history.

#### DELETE `/api/v1/chat/messages`
Clear chat history.

### Quotes Endpoints

#### GET `/api/v1/quotes`
Get active quotes.

#### POST `/api/v1/quotes/regenerate`
Regenerate quotes (subject to daily limits).

### Payments Endpoints

#### POST `/api/v1/payments/create-checkout`
Create Stripe checkout session.

**Request:**
```json
{
  "priceId": "price_...",
  "tier": "premium"
}
```

#### GET `/api/v1/payments/portal`
Get Stripe customer portal URL.

#### POST `/api/v1/payments/webhook`
Stripe webhook endpoint (public).

### Subscriptions Endpoints

#### GET `/api/v1/subscriptions/current`
Get current subscription details.

#### POST `/api/v1/subscriptions/cancel`
Cancel subscription (at period end).

### Migration Endpoints

#### POST `/api/v1/migration/import-localStorage`
Import data from frontend localStorage.

**Request:**
```json
{
  "onboardingData": { ... },
  "userProgress": { ... },
  "plan": [ ... ],
  "chatMessages": [ ... ],
  "quotes": [ ... ]
}
```

## 🔒 Security Features

- **JWT Authentication**: All endpoints (except public ones) require authentication
- **Rate Limiting**: 100 requests per minute per IP
- **Input Validation**: All inputs validated with class-validator
- **CORS**: Configured to only allow requests from frontend URL
- **Helmet**: Security headers enabled
- **Row Level Security**: Database-level security with Supabase RLS
- **Audit Logging**: All sensitive operations logged

## 📊 Subscription Tiers

### Free Tier
- 3 days unlocked
- 3 AI messages per day (GPT-3.5)
- 3 quote regenerations per day

### Starter Tier ($9.99/month)
- 7 days unlocked
- 10 AI messages per day (GPT-3.5)
- 5 quote regenerations per day

### Premium Tier ($19.99/month)
- 30 days unlocked
- Unlimited AI messages (GPT-4)
- Unlimited quote regenerations
- Support messages from loved ones

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚢 Deployment

### Railway

1. Create new project on Railway
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Build command: `npm install && npm run build`
4. Start command: `npm run start:prod`
5. Add environment variables

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:
- Use production Supabase URL and keys
- Use Stripe live mode keys
- Set `NODE_ENV=production`
- Configure proper `FRONTEND_URL`

## 📝 Project Structure

```
backend/
├── src/
│   ├── common/           # Shared utilities (guards, decorators, constants)
│   ├── config/           # Configuration module
│   ├── database/         # Supabase service
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── users/        # User management
│   │   ├── onboarding/   # Onboarding flow
│   │   ├── plans/        # Plan generation
│   │   ├── tasks/        # Task management
│   │   ├── progress/     # Progress tracking
│   │   ├── chat/         # AI chat
│   │   ├── quotes/       # Quote generation
│   │   ├── payments/     # Stripe integration
│   │   ├── subscriptions/# Subscription management
│   │   └── migration/    # Data migration
│   ├── types/            # TypeScript enums
│   ├── app.module.ts     # Root module
│   └── main.ts           # Application entry point
├── database-schema.sql   # Supabase database schema
├── .env.example          # Environment variables template
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT License

## 🆘 Support

For issues or questions:
- Create an issue on GitHub
- Email: support@better-self.app

---

Built with ❤️ using NestJS, Supabase, Stripe, and OpenAI
