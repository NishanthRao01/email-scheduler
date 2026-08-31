# Email Scheduler

## 1. How to Run

### Backend

The backend uses Express, MySQL, Prisma, Redis, and BullMQ with a separate worker for email processing.

From the project root:

~~~bash
docker compose up -d
~~~

Start the backend:

~~~bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
~~~

Start the BullMQ worker in a separate terminal:

~~~bash
cd backend
npm run dev:worker
~~~

The worker connects to Redis and processes scheduled email jobs asynchronously.

### Frontend

In a separate terminal:

~~~bash
cd frontend
npm install
npm run dev
~~~

The frontend runs with Vite and communicates with the Express backend through REST APIs.

---

## 2. Ethereal Email & Environment Variables

Ethereal Email is used as the SMTP service for development and testing.

Create an account at:

https://ethereal.email/

Configure the Ethereal SMTP credentials in the backend `.env` file.

Required environment variables:

~~~env
DATABASE_URL=
REDIS_URL=
JWT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=
~~~

The variable names are also provided in `.env.example`.

Never commit the actual `.env` file or credentials to GitHub.

---

## 3. Architecture Overview

### How Scheduling Works

The scheduling flow is:

~~~text
Frontend
   ↓
Express API
   ↓
Validate Request
   ↓
MySQL
   ↓
BullMQ
   ↓
Redis
   ↓
Email Worker
   ↓
Ethereal SMTP
~~~

The API validates the campaign and stores the campaign and email records in MySQL. Each email is then added to BullMQ with its scheduled execution time.

BullMQ uses Redis as its queue backend. The separate worker processes jobs when they become due, sends the emails through Ethereal SMTP, and updates their status in MySQL.

### How Persistence on Restart Is Handled

MySQL acts as the durable source of truth.

Campaigns, recipients, scheduled times, and email statuses are persisted before processing.

When the worker starts, it reconciles pending emails from MySQL with the BullMQ queue. This allows scheduled emails to survive backend or worker restarts.

### How Rate Limiting & Concurrency Are Implemented

Each sender has a configurable hourly sending limit using a UTC-based rate-limit window.

If the limit is reached, pending emails are rescheduled for the next available window.

A configurable delay can also be applied between emails to prevent burst sending.

Email processing runs in a separate BullMQ worker with configurable concurrency, keeping background processing independent from API requests.

---

## 4. Features Implemented

### Backend

#### Scheduler

- Campaign and scheduled email creation
- Future email scheduling
- Configurable start time
- Configurable delay between emails
- Configurable hourly sending limit
- BullMQ-based job scheduling

#### Persistence

- MySQL + Prisma
- Persistent users, senders, campaigns, and emails
- Email status and attempt tracking
- Pending email reconciliation after restart

#### Rate Limiting

- Per-sender hourly limit
- UTC-based rate-limit window
- Configurable email delay
- Automatic rescheduling when the limit is reached
- Slack notification for rate-limit events

#### Concurrency

- Separate BullMQ worker
- Redis-backed queue
- Asynchronous email processing
- Configurable worker concurrency

### Frontend

#### Login

- Google OAuth
- JWT authentication
- User profile and avatar
- Logout
- Slack connection status

#### Dashboard

- Scheduled Emails
- Sent Emails
- Email status and previews
- Loading and empty states
- Refresh functionality

#### Compose

- Sender selection
- Subject and body
- Multiple recipients
- CSV/text lead upload and email parsing
- Recipient count and preview
- Start time, delay, and hourly limit
- Schedule campaign

#### Tables

- Scheduled email list
- Sent email list
- Recipient, subject, time, and status
- Email detail view

#### Slack

- Slack OAuth connection
- Connection status
- Disconnect option
- Rate-limit notifications