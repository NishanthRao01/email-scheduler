import type { ScheduledEmail, SentEmail } from "../types/email";
import type { AuthUser } from "../types/auth";

interface EmailDetailProps {
  email: ScheduledEmail | SentEmail;
  currentUser: AuthUser;
  onBack: () => void;
}

export const EmailDetail = ({ email, currentUser, onBack }: EmailDetailProps) => {
  const isScheduled = "scheduledAt" in email;
  const timeLabel = isScheduled
    ? new Date((email as ScheduledEmail).scheduledAt).toLocaleString()
    : (email as SentEmail).sentAt
    ? new Date((email as SentEmail).sentAt!).toLocaleString()
    : "—";

  const senderName = email.sender?.name || "Sender";
  const senderEmail = email.sender?.email || "sender@domain.com";
  const senderInitials = senderName ? senderName[0].toUpperCase() : "S";

  return (
    <div className="email-detail-panel">
      {/* Detail Header */}
      <div className="detail-header">
        <div className="detail-header-left">
          <button type="button" className="back-arrow-button" onClick={onBack} title="Back to list">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              />
            </svg>
          </button>
          <h1 className="detail-subject-title">
            {email.subject}
            <span className="subject-id-badge"> | {email.id}</span>
          </h1>
        </div>

        <div className="detail-header-right">
          <button type="button" className="icon-action-button" title="Star email">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          </button>
          <button type="button" className="icon-action-button" title="Archive email">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.41l.83-1zM5 19V8h14v11H5zm3-5h8v-2H8v2z"
              />
            </svg>
          </button>
          <button type="button" className="icon-action-button" title="Delete email">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              />
            </svg>
          </button>
          <div className="header-divider" />
          {currentUser.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="header-user-avatar" />
          ) : (
            <div className="header-user-avatar-placeholder">
              {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
            </div>
          )}
        </div>
      </div>

      {/* Email Body Card */}
      <div className="detail-body-container">
        <div className="email-message-card">
          <div className="message-sender-row">
            <div className="sender-avatar-badge">
              {senderInitials}
            </div>
            <div className="sender-details">
              <div className="sender-name-wrapper">
                <span className="sender-name">{senderName}</span>
                <span className="sender-email">&lt;{senderEmail}&gt;</span>
              </div>
              <button type="button" className="recipient-dropdown-trigger">
                to {email.recipient}
                <svg viewBox="0 0 24 24" width="12" height="12" className="caret-icon">
                  <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
                </svg>
              </button>
            </div>
            <div className="message-timestamp">
              {timeLabel}
            </div>
          </div>

          <div className="message-content">
            <div className="plain-body-content" style={{ whiteSpace: "pre-wrap" }}>
              {email.body || "No email body content available."}
            </div>
            
            <div className="detail-status-section" style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #eef0ee", fontSize: "12px", color: "#697179" }}>
              <div><strong>Status:</strong> {email.status}</div>
              <div><strong>Recipient:</strong> {email.recipient}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
