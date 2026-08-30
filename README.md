# Email Scheduler

## 1. How to Run

### Backend

The backend is built with Express and uses MySQL for persistent data, Redis with BullMQ for asynchronous job processing, and a separate worker process for sending emails.

From the project root, start MySQL and Redis:

docker compose up -d

Then start the backend:

cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev

Start the BullMQ worker in a separate terminal:

cd backend
npm run dev:worker

The worker connects to Redis and processes scheduled email jobs asynchronously.

### Frontend

In a separate terminal:

cd frontend
npm install
npm run dev

The frontend runs using Vite and communicates with the Express backend through the REST APIs.

---

## 2. Ethereal Email and Environment Variables

Ethereal Email is used as the SMTP service for development and testing.

Create an Ethereal account at:

https://ethereal.email/

Create an SMTP user and configure the credentials in the backend environment.

Required environment variables include:

DATABASE_URL
REDIS_URL
JWT_SECRET

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI

ETHEREAL_HOST
ETHEREAL_PORT
ETHEREAL_USER
ETHEREAL_PASSWORD

SLACK_CLIENT_ID
SLACK_CLIENT_SECRET
SLACK_REDIRECT_URI

FRONTEND_URL

The required variable names are also provided in .env.example.

The actual .env file and credentials should not be committed to the repository.

---

## 3. Architecture Overview

### How Scheduling Works

The scheduling flow is:

User
  |
  v
React Frontend
  |
  v
Express API
  |
  v
Validate Request
  |
  v
MySQL
  |
  +---- Campaign and email records persisted
  |
  v
BullMQ
  |
  v
Redis
  |
  v
Email Worker
  |
  v
Ethereal SMTP

When the user schedules a campaign, the frontend sends the campaign details to the Express API.

The API validates the request and stores the campaign and individual email records in MySQL.

Each email is then added to BullMQ with its scheduled execution time.

Redis stores the queue data, and the separate BullMQ worker processes the jobs when they become due.

The worker sends the email through Ethereal SMTP and updates the email status in MySQL.

### How Persistence on Restart Is Handled

MySQL is used as the durable source of truth.

Campaigns, recipients, scheduled times, statuses, and email attempts are persisted in the database before processing.

When the worker starts, it checks for pending emails and reconciles them with the BullMQ queue.

This means scheduled emails are not lost if the worker or backend process is restarted.

The worker can recover pending emails from the persisted database state and continue processing them.

### How Rate Limiting Is Implemented

Each campaign has a configurable hourly limit for its sender.

The worker checks the sender's email count for the current hourly rate-limit window before sending an email.

If the hourly limit has been reached, the email remains pending and is rescheduled for the next available hourly window.

The rate-limit window is based on UTC.

The system also supports a configurable delay between emails.

For example:

Delay = 10 seconds

Recipient 1 → sent
Recipient 2 → +10 seconds
Recipient 3 → +20 seconds

This prevents emails from being sent immediately in a single burst.

### How Concurrency Is Implemented

Email processing is handled by a separate BullMQ worker instead of the Express API process.

The API creates and schedules jobs, while the worker handles email delivery asynchronously.

Redis provides the queue backend for BullMQ.

This keeps email processing independent from API requests and allows the worker to process scheduled jobs without blocking the API.

---

## 4. Features Implemented

### Backend

#### Scheduler

- Create email campaigns
- Schedule emails for future delivery
- Create individual BullMQ jobs for scheduled emails
- Support configurable start time
- Support configurable delay between emails
- Support configurable hourly sending limit
- Process scheduled emails through a separate worker

#### Persistence

- MySQL database using Prisma
- Persistent users
- Persistent senders
- Persistent campaigns
- Persistent email records
- Email status tracking
- Email attempt tracking
- Pending email reconciliation after worker restart
- Scheduled emails survive application/worker restarts

#### Rate Limiting

- Per-sender hourly email limit
- UTC-based hourly rate-limit window
- Configurable delay between emails
- Automatic rescheduling when the hourly limit is reached
- Slack notification when the hourly limit is reached

#### Concurrency

- Separate BullMQ worker process
- Redis-backed job queue
- Asynchronous email processing
- API and email processing run independently
- Controlled background job processing

### Frontend

#### Login

- Google OAuth login
- JWT-based authentication
- User name display
- User email display
- User avatar display
- Logout
- Slack connection status

#### Dashboard

- Scheduled Emails section
- Sent Emails section
- Scheduled email status
- Sent email status
- Recipient information
- Subject and body preview
- Loading states
- Empty states
- Error handling
- Refresh functionality

#### Compose

- Sender selection
- Subject input
- Email body input
- Multiple recipients
- CSV/text file upload for email leads
- Email address parsing
- Recipient count
- Recipient preview
- Start time selection
- Delay between emails
- Hourly limit
- Schedule campaign

#### Tables

- Scheduled email table/list
- Sent email table/list
- Recipient
- Subject
- Scheduled time
- Sent time
- Status
- Email detail view

#### Slack

- Slack OAuth connection
- Slack connection status
- Slack disconnect option
- Slack notification when the hourly sending limit is reached