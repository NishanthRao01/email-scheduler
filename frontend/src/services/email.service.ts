import { api } from "./api";
import type { ScheduledEmail, SentEmail, ScheduleEmailInput, Sender } from "../types/email";

export const getScheduledEmails = async (): Promise<ScheduledEmail[]> => {
  const response = await api.get<{
    success: boolean;
    data: ScheduledEmail[];
  }>("/emails/scheduled");
  return response.data.data;
};

export const getSentEmails = async (): Promise<SentEmail[]> => {
  const response = await api.get<{
    success: boolean;
    data: SentEmail[];
  }>("/emails/sent");
  return response.data.data;
};

export const getSenders = async (): Promise<Sender[]> => {
  const response = await api.get<{
    success: boolean;
    data: Sender[];
  }>("/emails/senders");
  return response.data.data;
};

export const scheduleCampaign = async (input: ScheduleEmailInput): Promise<void> => {
  await api.post<{
    success: boolean;
    data: unknown;
  }>("/emails/schedule", input);
};
