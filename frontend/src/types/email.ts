export type EmailStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "FAILED";

export interface ScheduledEmail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  status: EmailStatus;
  sender?: Sender;
}

export interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt: string | null;
  status: "SENT" | "FAILED";
  sender?: Sender;
}

export interface ScheduleEmailInput {
  senderId: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
}

export interface Sender {
  id: string;
  email: string;
  name: string | null;
}