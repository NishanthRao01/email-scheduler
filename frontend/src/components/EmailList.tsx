import type { ScheduledEmail, SentEmail } from "../types/email";

interface EmailListProps {
  type: "scheduled" | "sent";
  emails: (ScheduledEmail | SentEmail)[];
  loading: boolean;
  error: string | null;
  onEmailClick: (email: ScheduledEmail | SentEmail) => void;
}

export const EmailList = ({
  type,
  emails,
  loading,
  error,
  onEmailClick,
}: EmailListProps) => {
  const formatScheduledTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const day = days[d.getDay()];
      
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const seconds = String(d.getSeconds()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      
      return `${day} ${hours}:${minutes}:${seconds} ${ampm}`;
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="email-list-state loading-state">
        <div className="skeleton-loader">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="email-list-state error-state">
        <svg viewBox="0 0 24 24" width="48" height="48" className="error-icon">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
          />
        </svg>
        <p className="error-message">Failed to load emails: {error}</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="email-list-state empty-state">
        <svg viewBox="0 0 24 24" width="64" height="64" className="empty-icon">
          <path
            fill="currentColor"
            d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
          />
        </svg>
        <p className="empty-text">No emails found in this category.</p>
      </div>
    );
  }

  return (
    <div className="email-list-container">
      {emails.map((email) => {
        const isScheduled = type === "scheduled";
        const scheduledEmail = email as ScheduledEmail;
        const sentEmail = email as SentEmail;

        return (
          <div
            key={email.id}
            className="email-row"
            onClick={() => onEmailClick(email)}
          >
            <div className="email-recipient">
              To: {email.recipient}
            </div>

            <div className="email-status-badge-container">
              {isScheduled ? (
                <span className="badge-scheduled">
                  <svg viewBox="0 0 24 24" width="12" height="12" className="badge-icon">
                    <path
                      fill="currentColor"
                      d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"
                    />
                  </svg>
                  {formatScheduledTime(scheduledEmail.scheduledAt)}
                </span>
              ) : (
                <span className={`badge-sent ${sentEmail.status === "FAILED" ? "failed" : ""}`}>
                  {sentEmail.status === "FAILED" ? "Failed" : "Sent"}
                </span>
              )}
            </div>

            <div className="email-subject-snippet">
              <span className="email-subject">{email.subject}</span>
              <span className="email-snippet">
                {" - "}
                {email.body || "No preview available..."}
              </span>
            </div>

            <button
              type="button"
              className="email-row-star"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};
