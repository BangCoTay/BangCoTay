# 🚀 Better-Self Backend - Quick Start Guide

## ✅ What's Been Created

A complete, production-ready NestJS backend with:

### ✨ Features Implemented
- ✅ **Authentication** - Supabase Auth with JWT
- ✅ **User Management** - Profile & subscription tracking
- ✅ **Onboarding** - Save user preferences to database
- ✅ **Plan Generation** - Server-side 30-day plan creation
- ✅ **Task Management** - Completion tracking with streaks
- ✅ **Progress Tracking** - Analytics and statistics
- ✅ **AI Chat** - Real OpenAI integration (GPT-3.5/GPT-4)
- ✅ **Quotes** - Personalized quote generation
- ✅ **Payments** - Stripe subscriptions with webhooks
- ✅ **Migration** - Import localStorage data
- ✅ **Security** - Rate limiting, CORS, validation, RLS

### 📁 Project Structure
```
backend/
├── src/
│   ├── common/              # Guards, decorators, constants
│   ├── config/              # Environment configuration
│   ├── database/            # Supabase service
│   ├── modules/             # 11 feature modules
│   │   ├── auth/           # Authentication
│   │   ├── users/          # User management
│   │   ├── onboarding/     # Onboarding flow
│   │   ├── plans/          # Plan generation
│   │   ├── tasks/          # Task management
│   │   ├── progress/       # Progress tracking
│   │   ├── chat/           # AI chat with OpenAI
│   │   ├── quotes/         # Quote generation
│   │   ├── payments/       # Stripe integration
│   │   ├── subscriptions/  # Subscription management
│   │   └── migration/      # Data migration
│   ├── types/              # TypeScript enums
│   ├── app.module.ts       # Root module
│   └── main.ts             # Entry point
├── database-schema.sql     # Complete database schema
├── .env.example            # Environment template
├── .gitignore
└── README.md               # Full documentation
```

---

## 🎯 Next Steps to Get Running

### Step 1: Set Up Supabase (15 minutes)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose organization and region
   - Set database password (save it!)

2. **Run Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `backend/database-schema.sql`
   - Paste and run the SQL
   - This creates 11 tables, indexes, RLS policies, and triggers

3. **Get API Keys**
   - Go to Project Settings → API
   - Copy:
     - `Project URL` → `SUPABASE_URL`
     - `anon public` key → `SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
   - Go to Project Settings → API → JWT Settings
   - Copy `JWT Secret` → `JWT_SECRET`

### Step 2: Set Up Stripe (10 minutes)

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Sign up for account
   - Activate test mode

2. **Create Products**
   - Go to Products → Add Product
   - Create "Starter Plan" - $9.99/month recurring
   - Create "Premium Plan" - $19.99/month recurring
   - Copy the price IDs (start with `price_`)

3. **Get API Keys**
   - Go to Developers → API Keys
   - Copy `Secret key` (test mode) → `STRIPE_SECRET_KEY`

4. **Set Up Webhook** (do this after deploying)
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-api.com/api/v1/payments/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
   - Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

### Step 3: Get OpenAI API Key (5 minutes)

1. Go to https://platform.openai.com
2. Sign up / Log in
3. Go to API Keys
4. Create new secret key
5. Copy key → `OPENAI_API_KEY`
6. Add payment method (required for API access)

### Step 4: Configure Environment (2 minutes)

1. **Copy environment template**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Fill in your credentials in `.env`**
   ```env
   # Server
   NODE_ENV=development
   PORT=3000
   API_PREFIX=api/v1

   # Supabase (from Step 1)
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   JWT_SECRET=your-jwt-secret

   # Stripe (from Step 2)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ID_STARTER=price_...
   STRIPE_PRICE_ID_PREMIUM=price_...

   # OpenAI (from Step 3)
   OPENAI_API_KEY=sk-...

   # Frontend URL
   FRONTEND_URL=http://localhost:8080
   ```

### Step 5: Install & Run (3 minutes)

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Run in development mode
npm run start:dev
```

You should see:
```
🚀 Application is running on: http://localhost:3000/api/v1
📚 Environment: development
```

---

## 🧪 Test the API

### Test Authentication

```bash
# Sign up
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Response will include accessToken - save it!
```

### Test Protected Endpoint

```bash
# Get user profile (replace YOUR_TOKEN)
curl http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 API Endpoints Summary

### Public Endpoints (No Auth Required)
- `POST /api/v1/auth/signup` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/payments/webhook` - Stripe webhook

### Protected Endpoints (Auth Required)
- **Auth**: `/auth/me`, `/auth/logout`
- **Users**: `/users/profile`, `/users/subscription`
- **Onboarding**: `/onboarding` (GET, POST)
- **Plans**: `/plans/generate`, `/plans/current`, `/plans/:id/day/:num`
- **Tasks**: `/tasks`, `/tasks/:id/complete`, `/tasks/:id/uncomplete`
- **Progress**: `/progress`, `/progress/analytics`
- **Chat**: `/chat/messages` (GET, POST, DELETE)
- **Quotes**: `/quotes`, `/quotes/regenerate`
- **Payments**: `/payments/create-checkout`, `/payments/portal`
- **Subscriptions**: `/subscriptions/current`, `/subscriptions/cancel`
- **Migration**: `/migration/import-localStorage`

---

## 🔒 Security Features

✅ **JWT Authentication** - All endpoints protected by default
✅ **Rate Limiting** - 100 requests/minute per IP
✅ **Input Validation** - All inputs validated with class-validator
✅ **CORS** - Only allows requests from configured frontend URL
✅ **Helmet** - Security headers enabled
✅ **Row Level Security** - Database-level security with Supabase RLS
✅ **Audit Logging** - Sensitive operations logged to database

---

## 📈 Subscription Tier Limits

| Feature | Free | Starter ($9.99) | Premium ($19.99) |
|---------|------|-----------------|------------------|
| Days Unlocked | 3 | 7 | 30 |
| AI Messages/Day | 3 (GPT-3.5) | 10 (GPT-3.5) | Unlimited (GPT-4) |
| Quote Regenerations/Day | 3 | 5 | Unlimited |
| Support Messages | ❌ | ❌ | ✅ |

---

## 🐛 Troubleshooting

### "Supabase configuration is missing"
- Check that all `SUPABASE_*` variables are set in `.env`
- Make sure `.env` file is in the `backend/` directory

### "OpenAI not configured"
- Check `OPENAI_API_KEY` is set
- Verify you have billing enabled on OpenAI account

### "Stripe not configured"
- Check `STRIPE_SECRET_KEY` is set
- Make sure you're using test mode keys for development

### Database connection errors
- Verify Supabase project is active
- Check database password is correct
- Ensure RLS policies are enabled

### CORS errors
- Check `FRONTEND_URL` matches your frontend URL exactly
- Include protocol (http:// or https://)

---

## 🚢 Deployment

### Quick Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set SUPABASE_URL=...
railway variables set SUPABASE_ANON_KEY=...
# ... (add all variables)

# Deploy
railway up
```

### Quick Deploy to Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
5. Add all environment variables
6. Deploy

---

## 📚 Additional Resources

- **NestJS Docs**: https://docs.nestjs.com
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Supabase API keys copied
- [ ] Stripe account created
- [ ] Stripe products created
- [ ] Stripe API keys copied
- [ ] OpenAI API key obtained
- [ ] `.env` file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Backend running (`npm run start:dev`)
- [ ] Test signup endpoint works
- [ ] Test protected endpoint works

---

## 🎉 You're Ready!

Your backend is now fully functional and ready to integrate with the frontend!

**Next**: Update your frontend to use the API instead of localStorage.

Need help? Check the full README.md for detailed API documentation.
