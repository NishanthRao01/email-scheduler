import { useState, useRef, useEffect } from "react";
import type { AuthUser } from "../types/auth";

interface SidebarProps {
  user: AuthUser;
  activeTab: "scheduled" | "sent" | "compose" | "detail";
  scheduledCount: number;
  sentCount: number;
  onTabChange: (tab: "scheduled" | "sent" | "compose") => void;
  onLogout: () => void;
  onConnectSlack: () => void;
  onDisconnectSlack: () => void;
}

export const Sidebar = ({
  user,
  activeTab,
  scheduledCount,
  sentCount,
  onTabChange,
  onLogout,
  onConnectSlack,
  onDisconnectSlack,
}: SidebarProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        ONB
      </div>

      <div className="profile-container" ref={dropdownRef}>
        <button
          type="button"
          className="profile-card"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">{initials}</div>
          )}
          <div className="profile-info">
            <span className="profile-name">{user.name || "User"}</span>
            <span className="profile-email">{user.email}</span>
          </div>
          <svg className="chevron-icon" viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
          </svg>
        </button>

        {showDropdown && (
          <div className="profile-dropdown">
            {user.slackConnection ? (
              <>
                <div className="dropdown-status-item">
                  <span className="slack-dot green" />
                  <span className="slack-status-text">✓ Slack Connected</span>
                </div>
                {user.slackConnection.teamId && (
                  <a
                    href={`https://slack.com/app_redirect?team=${user.slackConnection.teamId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="slack-action-button open-slack"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path
                        fill="currentColor"
                        d="M5 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H5zm0 18V4h14v16H5z"
                      />
                    </svg>
                    Open Slack
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onDisconnectSlack();
                    setShowDropdown(false);
                  }}
                  className="slack-action-button disconnect"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      fill="currentColor"
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    />
                  </svg>
                  Disconnect Slack
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onConnectSlack();
                  setShowDropdown(false);
                }}
                className="slack-action-button connect"
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    fill="currentColor"
                    d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                  />
                </svg>
                Connect Slack
              </button>
            )}
            
            <div className="dropdown-divider" />

            <button type="button" onClick={onLogout} className="logout-button">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M14.08 15.59L16.67 13H11v-2h5.67l-2.59-2.59L15.5 7l5 5-5 5-1.42-1.41M19 12c0 3.86-3.14 7-7 7s-7-3.14-7-7 3.14-7 7-7c1.93 0 3.68.78 4.95 2.05l-1.42 1.42C14.64 5.58 13.4 5 12 5c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7h2z"
                />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        className="compose-button"
        onClick={() => onTabChange("compose")}
      >
        Compose
      </button>

      <div className="nav-section">
        <div className="nav-section-title">CORE</div>
        
        <button
          type="button"
          className={`nav-item ${activeTab === "scheduled" ? "active" : ""}`}
          onClick={() => onTabChange("scheduled")}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="currentColor"
              d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"
            />
          </svg>
          <span className="nav-label">Scheduled</span>
          <span className="nav-badge">{scheduledCount}</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === "sent" ? "active" : ""}`}
          onClick={() => onTabChange("sent")}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="currentColor"
              d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
            />
          </svg>
          <span className="nav-label">Sent</span>
          <span className="nav-badge">{sentCount}</span>
        </button>
      </div>
    </aside>
  );
};
