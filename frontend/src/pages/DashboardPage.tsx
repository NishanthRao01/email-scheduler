import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { EmailList } from "../components/EmailList";
import { EmailDetail } from "../components/EmailDetail";
import { ComposeView } from "../components/ComposeView";
import { getStoredToken, getStoredUser, logout, getCurrentUser, getSlackConnectUrl, disconnectSlack } from "../services/auth.service";
import { getScheduledEmails, getSentEmails } from "../services/email.service";
import type { ScheduledEmail, SentEmail } from "../types/email";
import type { AuthUser } from "../types/auth";

export const DashboardPage = () => {
  const token = getStoredToken();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  
  // Navigation & view states
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent" | "compose" | "detail">("scheduled");
  const [selectedEmail, setSelectedEmail] = useState<ScheduledEmail | SentEmail | null>(null);
  
  // Data states
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Redirect if unauthenticated
  useEffect(() => {
    if (!token) {
      window.location.replace("/login");
    }
  }, [token]);

  // Load and refresh user info & emails
  const loadProfile = async () => {
    try {
      const profile = await getCurrentUser();
      setCurrentUser(profile);
    } catch {
      // If profile endpoint fails, fallback to stored user info if present
    }
  };

  const fetchEmailData = async () => {
    setTimeout(() => {
      setLoading(true);
      setError(null);
    }, 0);
    try {
      const [scheduled, sent] = await Promise.all([
        getScheduledEmails(),
        getSentEmails(),
      ]);
      setScheduledEmails(scheduled);
      setSentEmails(sent);
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || "Failed to load email logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        loadProfile();
        fetchEmailData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [token]);

  if (!token) {
    return null;
  }

  const handleLogout = () => {
    logout();
    window.location.replace("/login");
  };

  const handleConnectSlack = () => {
    try {
      if (!token) return;
      const redirectUrl = getSlackConnectUrl(token);
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const popup = window.open(
        redirectUrl,
        "slack-oauth",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!popup) {
        alert("Popup blocker is enabled. Please allow popups to connect to Slack.");
        return;
      }

      const interval = setInterval(async () => {
        try {
          const profile = await getCurrentUser();
          setCurrentUser(profile);
          if (profile.slackConnection) {
            clearInterval(interval);
            popup.close();
          }
        } catch {
          // Ignore errors during polling
        }
      }, 1500);

      const popupCheck = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupCheck);
          clearInterval(interval);
          loadProfile();
        }
      }, 1000);
    } catch {
      alert("Failed to start Slack integration.");
    }
  };

  const handleDisconnectSlack = async () => {
    try {
      await disconnectSlack();
      await loadProfile();
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      alert(errorResponse.response?.data?.message || "Failed to disconnect Slack.");
    }
  };

  const handleEmailClick = (email: ScheduledEmail | SentEmail) => {
    setSelectedEmail(email);
    setActiveTab("detail");
  };

  const handleTabChange = (tab: "scheduled" | "sent" | "compose") => {
    setActiveTab(tab);
    setSelectedEmail(null);
  };

  const handleRefresh = () => {
    fetchEmailData();
  };

  // Filter based on search query
  const filteredScheduled = scheduledEmails.filter(
    (e) =>
      e.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSent = sentEmails.filter(
    (e) =>
      e.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      {currentUser && (
        <Sidebar
          user={currentUser}
          activeTab={activeTab}
          scheduledCount={scheduledEmails.length}
          sentCount={sentEmails.length}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
          onConnectSlack={handleConnectSlack}
          onDisconnectSlack={handleDisconnectSlack}
        />
      )}

      <main className="dashboard-content-panel">
        {activeTab === "compose" ? (
          <ComposeView
            onBack={() => handleTabChange("scheduled")}
            onSuccess={() => {
              handleTabChange("scheduled");
              fetchEmailData();
            }}
          />
        ) : activeTab === "detail" && selectedEmail && currentUser ? (
          <EmailDetail
            email={selectedEmail}
            currentUser={currentUser}
            onBack={() => handleTabChange(selectedEmail.status === "PENDING" || selectedEmail.status === "PROCESSING" ? "scheduled" : "sent")}
          />
        ) : (
          <>
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRefresh={handleRefresh}
            />
            
            <div className="dashboard-view-body">
              {activeTab === "scheduled" && (
                <EmailList
                  type="scheduled"
                  emails={filteredScheduled}
                  loading={loading}
                  error={error}
                  onEmailClick={handleEmailClick}
                />
              )}

              {activeTab === "sent" && (
                <EmailList
                  type="sent"
                  emails={filteredSent}
                  loading={loading}
                  error={error}
                  onEmailClick={handleEmailClick}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};