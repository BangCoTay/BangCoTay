# 🚀 API Quick Reference

Base URL: `http://localhost:3000/api/v1` (development)

## 🔑 Authentication

All endpoints require `Authorization: Bearer <token>` header except public ones.

### Public Endpoints

```bash
# Sign Up
POST /auth/signup
Body: { email, password, fullName }

# Login
POST /auth/login
Body: { email, password }

# Refresh Token
POST /auth/refresh
Body: { refreshToken }
```

### Protected Endpoints

```bash
# Get Current User
GET /auth/me

# Logout
POST /auth/logout
```

---

## 👤 Users

```bash
# Get Profile
GET /users/profile

# Update Profile
PUT /users/profile
Body: { fullName?, avatarUrl? }

# Get Subscription
GET /users/subscription
```

---

## 📝 Onboarding

```bash
# Submit Onboarding
POST /onboarding
Body: { niche, addiction, severity, painPoints[], healthyHabit }

# Get Onboarding
GET /onboarding
```

---

## 📅 Plans

```bash
# Generate Plan
POST /plans/generate

# Get Current Plan
GET /plans/current

# Get Day Plan
GET /plans/:planId/day/:dayNumber
```

---

## ✅ Tasks

```bash
# Get Tasks
GET /tasks?dayNumber=1&completed=false

# Complete Task
POST /tasks/:taskId/complete

# Uncomplete Task
POST /tasks/:taskId/uncomplete
```

---

## 📊 Progress

```bash
# Get Progress
GET /progress

# Get Analytics
GET /progress/analytics
```

---

## 🤖 Chat

```bash
# Send Message
POST /chat/messages
Body: { content, coachPersona? }

# Get Messages
GET /chat/messages?limit=50&offset=0

# Clear History
DELETE /chat/messages
```

---

## 💬 Quotes

```bash
# Get Quotes
GET /quotes

# Regenerate Quotes
POST /quotes/regenerate
```

---

## 💳 Payments

```bash
# Create Checkout
POST /payments/create-checkout
Body: { priceId, tier }

# Get Portal
GET /payments/portal

# Webhook (Public)
POST /payments/webhook
```

---

## 🔄 Subscriptions

```bash
# Get Current Subscription
GET /subscriptions/current

# Cancel Subscription
POST /subscriptions/cancel
```

---

## 🔄 Migration

```bash
# Import localStorage Data
POST /migration/import-localStorage
Body: { onboardingData, userProgress, plan[], chatMessages[], quotes[] }
```

---

## 📊 Subscription Limits

| Feature | Free | Starter | Premium |
|---------|------|---------|---------|
| Days | 3 | 7 | 30 |
| AI Msgs | 3/day | 10/day | Unlimited |
| Quotes | 3/day | 5/day | Unlimited |
| Model | GPT-3.5 | GPT-3.5 | GPT-4 |

---

## 🔒 Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (subscription tier required)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## 🧪 Example: Complete Flow

```bash
# 1. Sign Up
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","fullName":"John Doe"}'

# Save the accessToken from response

# 2. Submit Onboarding
curl -X POST http://localhost:3000/api/v1/onboarding \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"niche":"digital","addiction":"social-media","severity":"moderate","painPoints":["time","energy"],"healthyHabit":"reading"}'

# 3. Generate Plan
curl -X POST http://localhost:3000/api/v1/plans/generate \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Get Current Plan
curl http://localhost:3000/api/v1/plans/current \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Complete a Task
curl -X POST http://localhost:3000/api/v1/tasks/TASK_ID/complete \
  -H "Authorization: Bearer YOUR_TOKEN"

# 6. Send AI Message
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"I need motivation today","coachPersona":"Alex"}'

# 7. Get Progress
curl http://localhost:3000/api/v1/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🛠️ Environment Variables

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=your-jwt-secret

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PREMIUM=price_...

OPENAI_API_KEY=sk-...

FRONTEND_URL=http://localhost:8080
```

---

## 🚀 Quick Start

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run start:dev
```

---

## 📚 Full Documentation

- **Setup Guide**: `backend/SETUP.md`
- **API Docs**: `backend/README.md`
- **Implementation**: `backend/IMPLEMENTATION_SUMMARY.md`
- **Database Schema**: `backend/database-schema.sql`
