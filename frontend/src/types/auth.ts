export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  slackConnection?: {
    id: string;
    teamName: string | null;
    teamId: string | null;
  } | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: AuthUser;
  token: string;
}