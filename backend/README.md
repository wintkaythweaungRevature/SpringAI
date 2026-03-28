# SpringAI Backend - Auth & Subscription

Spring Boot backend for authentication, email verification, and Stripe subscription. The marketing site lists Starter / Pro / Growth; wire **separate Stripe Price IDs** per tier (or one price until you add multi-plan checkout).

## Features

- **Auth**: Login, Register, Verify Email, GET /me
- **Subscription**: Stripe Checkout, Webhook for subscription events
- **User model**: id, email, firstName, lastName, membershipType (FREE/MEMBER), role, emailVerified

## Setup

### 1. Configure `application.properties`

```properties
# JWT (required)
jwt.secret=your-32-char-secret-key-change-in-production

# Email (for verification emails)
spring.mail.host=smtp.example.com
spring.mail.port=587
spring.mail.username=your-email
spring.mail.password=your-password
app.base-url=https://your-frontend-domain.com

# Stripe
stripe.secret-key=sk_live_...
stripe.price-id=price_...   # Default recurring Price ID (add more env vars when you ship multi-tier checkout)
stripe.webhook-secret=whsec_...

# Success/Cancel URLs (after Stripe checkout)
app.success-url=https://your-frontend-domain.com
app.cancel-url=https://your-frontend-domain.com
```

### 2. Create Stripe Products & Prices

1. Stripe Dashboard → Products — create prices for **Starter ($19)**, **Pro ($39)**, **Growth ($79)** (monthly and optional annual).
2. Copy the default monthly Price ID to `stripe.price-id` until checkout passes a selected price.

### 3. Webhook

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://api.your-domain.com/api/subscription/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.deleted`
4. Copy signing secret to `stripe.webhook-secret`

### 4. Facebook & Instagram (Video Publisher)

For publishing to Facebook Pages and Instagram Reels, see **[docs/FACEBOOK_API_SETUP.md](../docs/FACEBOOK_API_SETUP.md)**.

Required env vars: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`.

### 5. Run

```bash
cd backend
mvn spring-boot:run
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | No | Login with email/password |
| POST | /api/auth/register | No | Register (sends verification email) |
| GET | /api/auth/verify-email?token=... | No | Verify email |
| GET | /api/auth/me | Yes | Get current user profile |
| POST | /api/subscription/checkout | Yes | Create Stripe checkout session |
| POST | /api/subscription/webhook | No | Stripe webhook |

## Login Response

```json
{
  "token": "jwt...",
  "email": "user@example.com",
  "membershipType": "FREE",
  "userId": 1,
  "emailVerified": true
}
```

## Feature Access

- **Ask AI** (free): login + emailVerified
- **Member features** (image, PDF, transcribe, reply, resume): login + emailVerified + membershipType=MEMBER
