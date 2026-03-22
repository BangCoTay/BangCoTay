# Setup Guide: Stripe & OpenAI

This guide explains how to configure the environment variables for Stripe and OpenAI in your `backend/.env` file.

## 💳 Stripe Configuration

### 1. How to get `STRIPE_WEBHOOK_SECRET`

The `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`) is used to verify that events sent to your webhook endpoint are actually from Stripe.

#### For Local Development:
1.  **Install the Stripe CLI**: [Follow the official guide](https://stripe.com/docs/stripe-cli).
2.  **Login to your Stripe account**:
    ```bash
    stripe login
    ```
3.  **Listen for events**:
    ```bash
    stripe listen --forward-to localhost:3000/api/v1/payments/webhook
    ```
4.  The CLI will output your **webhook signing secret** (e.g., `whsec_...`). Copy this value and paste it into your `.env` file for `STRIPE_WEBHOOK_SECRET`.

#### For Production:
1.  Go to the [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks).
2.  Add an endpoint (e.g., `https://yourdomain.com/api/v1/payments/webhook`).
3.  Once created, click **"Reveal"** under the **Signing secret** section to get your `whsec_...` key.

---

### 2. How to use Stripe Sandbox (Test Mode)

Stripe provides a **Test Mode** that allows you to simulate payments without using real money.

1.  **Enable Test Mode**: In the [Stripe Dashboard](https://dashboard.stripe.com/), toggle the **"Test mode"** switch at the top right.
2.  **Get Test API Keys**:
    - Go to **Developers > API keys**.
    - Use the **Secret key** (starts with `sk_test_...`) for your `STRIPE_SECRET_KEY` in `.env`.
3.  **Test Card Numbers**:
    - Use the standard test card: `4242 4242 4242 4242` with any future expiry date and any 3-digit CVC.
    - More test cards can be found [here](https://stripe.com/docs/testing).

---

## 🤖 OpenAI Configuration

### 1. How to get `OPENAI_API_KEY`

1.  **Create an account**: Go to [platform.openai.com](https://platform.openai.com/).
2.  **Generate a Key**:
    - Navigate to **Dashboard > API Keys**.
    - Click **"+ Create new secret key"**.
    - Copy the key immediately (it starts with `sk-...`). Paste it into your `.env` file for `OPENAI_API_KEY`.
3.  **Configure the Model**:
    - In your code, you can now specify the model you wish to use (e.g., `gpt-4o`, `gpt-4-turbo`, etc.). 
    - *Note: The application currently uses the `gpt-4o-mini` model. You can change this in `backend/src/services/openai.service.js`.*

---

## 🧪 Testing the Payment Flow

1.  Start your backend server: `npm run dev` (in the `backend` folder).
2.  Start your frontend: `npm run dev` (in the `frontend` folder).
3.  Click an "Upgrade" button in the UI.
4.  You will be redirected to the Stripe Checkout page.
5.  Enter a test email and use the `4242` test card.
6.  Upon success, you should be redirected back to the dashboard.
7.  Check your backend console and Stripe CLI terminal to see the `checkout.session.completed` event being processed.
