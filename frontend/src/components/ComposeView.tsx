import React, { useState, useEffect, useRef } from "react";
import type { Sender } from "../types/email";
import { getSenders, scheduleCampaign } from "../services/email.service";

interface ComposeViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const ComposeView = ({ onBack, onSuccess }: ComposeViewProps) => {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [selectedSenderId, setSelectedSenderId] = useState<string>("");
  
  // Recipients states
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientsInput, setRecipientsInput] = useState<string>("");
  
  const [subject, setSubject] = useState<string>("");
  const [delaySecs, setDelaySecs] = useState<string>("00");
  const [hourlyLimit, setHourlyLimit] = useState<string>("00");
  const [body, setBody] = useState<string>("");
  
  // Scheduling state
  const [startTime, setStartTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [showSendLater, setShowSendLater] = useState<boolean>(false);
  const [scheduledLabel, setScheduledLabel] = useState<string>("Send Immediately");
  
  // Status states
  const [loadingSenders, setLoadingSenders] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Attachments state (starts empty)
  const [attachments, setAttachments] = useState<{ name: string; size: number; previewUrl?: string }[]>([]);

  useEffect(() => {
    return () => {
      attachments.forEach((a) => {
        if (a.previewUrl) {
          URL.revokeObjectURL(a.previewUrl);
        }
      });
    };
  }, [attachments]);

  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);
  const sendLaterRef = useRef<HTMLDivElement>(null);

  // Parse recipients input for emails (derived state to include chips and any valid active typed text)
  const parsedRecipients = (() => {
    const list = [...recipients];
    const currentTrim = recipientsInput.trim();
    if (currentTrim) {
      const parts = currentTrim.split(/[\s,;]+/);
      parts.forEach((part) => {
        const cleaned = part.trim();
        if (cleaned && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
          if (!list.includes(cleaned)) {
            list.push(cleaned);
          }
        }
      });
    }
    return list;
  })();

  useEffect(() => {
    const loadSenders = async () => {
      try {
        setLoadingSenders(true);
        const data = await getSenders();
        setSenders(data);
        if (data.length > 0) {
          setSelectedSenderId(data[0].id);
        }
      } catch (err) {
        const errorResponse = err as { response?: { data?: { message?: string } } };
        setErrorMsg(errorResponse.response?.data?.message || "Failed to load senders list.");
      } finally {
        setLoadingSenders(false);
      }
    };
    loadSenders();
  }, []);

  // Close Send Later popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sendLaterRef.current && !sendLaterRef.current.contains(event.target as Node)) {
        setShowSendLater(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matched = text.match(emailRegex) || [];
        const uniqueEmails = Array.from(new Set(matched));

        if (uniqueEmails.length === 0) {
          setErrorMsg("No valid email addresses found in the uploaded file.");
          return;
        }

        setRecipients(uniqueEmails);
        setRecipientsInput("");
        setSuccessMsg(`Loaded ${uniqueEmails.length} email addresses from ${file.name}`);
      } catch {
        setErrorMsg("Failed to parse CSV/text file.");
      }
    };
    reader.readAsText(file);
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith("image/");
      setAttachments([
        ...attachments,
        {
          name: file.name,
          size: file.size,
          previewUrl: isImg ? URL.createObjectURL(file) : undefined,
        },
      ]);
    }
  };

  const handleRecipientsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // If it contains separators, extract complete emails
    if (value.includes(",") || value.includes(";") || value.includes(" ")) {
      const parts = value.split(/[\s,;]+/);
      const newChips: string[] = [];
      let lastPart = "";

      parts.forEach((part, idx) => {
        const cleaned = part.trim();
        if (idx === parts.length - 1) {
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
            newChips.push(cleaned);
          } else {
            lastPart = part;
          }
        } else {
          if (cleaned && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
            newChips.push(cleaned);
          }
        }
      });

      if (newChips.length > 0) {
        const updated = [...recipients];
        newChips.forEach((email) => {
          if (!updated.includes(email)) {
            updated.push(email);
          }
        });
        setRecipients(updated);
        setRecipientsInput(lastPart);
      } else {
        setRecipientsInput(value);
      }
    } else {
      setRecipientsInput(value);
    }
  };

  const handleRecipientsInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentTrim = recipientsInput.trim();
      if (currentTrim) {
        const parts = currentTrim.split(/[\s,;]+/);
        const updated = [...recipients];
        let changed = false;
        parts.forEach((part) => {
          const cleaned = part.trim();
          if (cleaned && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
            if (!updated.includes(cleaned)) {
              updated.push(cleaned);
              changed = true;
            }
          }
        });
        if (changed) {
          setRecipients(updated);
          setRecipientsInput("");
        }
      }
    } else if (e.key === "Backspace" && !recipientsInput && recipients.length > 0) {
      setRecipients(recipients.slice(0, -1));
    }
  };

  const handleRecipientsInputBlur = () => {
    const currentTrim = recipientsInput.trim();
    if (currentTrim) {
      const parts = currentTrim.split(/[\s,;]+/);
      const updated = [...recipients];
      let changed = false;
      parts.forEach((part) => {
        const cleaned = part.trim();
        if (cleaned && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
          if (!updated.includes(cleaned)) {
            updated.push(cleaned);
            changed = true;
          }
        }
      });
      if (changed) {
        setRecipients(updated);
        setRecipientsInput("");
      }
    }
  };

  const handleApplyPreset = (hoursToAdd: number, label: string) => {
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + hoursToAdd);
    if (hoursToAdd > 0 && (label.includes("10:") || label.includes("11:") || label.includes("3:"))) {
      const hour = label.includes("10:") ? 10 : label.includes("11:") ? 11 : 15;
      targetDate.setHours(hour, 0, 0, 0);
    }
    setStartTime(targetDate.toISOString().slice(0, 16));
    setScheduledLabel(`Send on ${targetDate.toLocaleDateString()} at ${targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedSenderId) {
      setErrorMsg("Please select a sender ('From' address).");
      return;
    }
    if (parsedRecipients.length === 0) {
      setErrorMsg("Please enter at least one valid recipient.");
      return;
    }
    if (!subject.trim()) {
      setErrorMsg("Please enter a subject.");
      return;
    }
    if (!body.trim()) {
      setErrorMsg("Please enter email body content.");
      return;
    }

    setSubmitting(true);
    try {
      const delayMs = parseInt(delaySecs, 10) * 1000;
      const limit = parseInt(hourlyLimit, 10);

      await scheduleCampaign({
        senderId: selectedSenderId,
        subject: subject.trim(),
        body: body,
        recipients: parsedRecipients,
        startTime: new Date(startTime).toISOString(),
        delayBetweenEmails: isNaN(delayMs) ? 0 : delayMs,
        hourlyLimit: isNaN(limit) ? 100 : limit,
      });

      setSuccessMsg("Email campaign scheduled successfully!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setErrorMsg(errorResponse.response?.data?.message || "Failed to schedule email campaign.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="compose-panel">
      {/* Compose Header */}
      <div className="compose-header">
        <div className="compose-header-left">
          <button type="button" className="back-arrow-button" onClick={onBack}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              />
            </svg>
          </button>
          <h1>Compose New Email</h1>
        </div>

        <div className="compose-header-right">
          {/* Paperclip Attachment Trigger with count badge */}
          <button
            type="button"
            className={`icon-action-button paperclip-btn ${attachments.length > 0 ? "has-attachments" : ""}`}
            onClick={() => attachmentFileInputRef.current?.click()}
            title="Upload attachment file"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.66 1.34 3 3 3s3-1.34 3-3V5c0-2.48-2.02-4.5-4.5-4.5S7 2.52 7 5v12.5c0 3.59 2.91 6.5 6.5 6.5s6.5-2.91 6.5-6.5V6h-1.5z"
              />
            </svg>
            {attachments.length > 0 && (
              <span className="attachment-badge-count">{attachments.length}</span>
            )}
          </button>
          
          <input
            type="file"
            ref={attachmentFileInputRef}
            onChange={handleAttachmentUpload}
            style={{ display: "none" }}
          />

          <input
            type="file"
            ref={csvFileInputRef}
            onChange={handleCsvUpload}
            accept=".csv,.txt"
            style={{ display: "none" }}
          />

          {/* Clock Scheduling Trigger */}
          <div className="scheduling-trigger-wrapper" ref={sendLaterRef}>
            <button
              type="button"
              className={`icon-action-button ${showSendLater ? "active" : ""}`}
              onClick={() => setShowSendLater(!showSendLater)}
              title="Schedule sending time"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="currentColor"
                  d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"
                />
              </svg>
            </button>

            {showSendLater && (
              <div className="send-later-popover">
                <h3 className="popover-title">Send Later</h3>
                
                <div className="date-picker-wrapper">
                  <input
                    type="datetime-local"
                    className="popover-date-input"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      const d = new Date(e.target.value);
                      if (!isNaN(d.getTime())) {
                        setScheduledLabel(`Send on ${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
                      }
                    }}
                  />
                </div>

                <ul className="popover-presets">
                  <li onClick={() => handleApplyPreset(24, "Tomorrow")}>
                    Tomorrow
                  </li>
                  <li onClick={() => handleApplyPreset(24, "Tomorrow, 10:00 AM")}>
                    Tomorrow, 10:00 AM
                  </li>
                  <li onClick={() => handleApplyPreset(25, "Tomorrow, 11:00 AM")}>
                    Tomorrow, 11:00 AM
                  </li>
                  <li onClick={() => handleApplyPreset(29, "Tomorrow, 3:00 PM")}>
                    Tomorrow, 3:00 PM
                  </li>
                </ul>

                <div className="popover-actions">
                  <button
                    type="button"
                    className="popover-cancel"
                    onClick={() => {
                      setStartTime(new Date().toISOString().slice(0, 16));
                      setScheduledLabel("Send Immediately");
                      setShowSendLater(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="popover-done"
                    onClick={() => setShowSendLater(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            form="compose-form"
            className="send-campaign-button"
            disabled={submitting}
          >
            {scheduledLabel !== "Send Immediately" ? "Send Later" : "Send"}
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="compose-body-container">
        {errorMsg && (
          <div className="compose-alert alert-error">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="compose-alert alert-success">
            {successMsg}
          </div>
        )}

        <form id="compose-form" onSubmit={handleSubmit} className="compose-form">
          {/* From Select */}
          <div className="form-group-inline">
            <label htmlFor="senderSelect">From</label>
            <div className="select-container">
              {loadingSenders ? (
                <span className="loading-text">Loading senders...</span>
              ) : senders.length === 0 ? (
                <span className="error-text">No senders found. Please configure a sender.</span>
              ) : (
                <select
                  id="senderSelect"
                  value={selectedSenderId}
                  onChange={(e) => setSelectedSenderId(e.target.value)}
                >
                  {senders.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name ? `${s.name} <${s.email}>` : s.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* To Input with inline chips and input box */}
          <div className="form-group-inline to-field-group">
            <label htmlFor="recipientsInput">To</label>
            <div className="to-input-container">
              <div className="recipient-chips-wrapper">
                {recipients.slice(0, 3).map((email, idx) => (
                  <span key={idx} className="recipient-green-chip">
                    {email}
                    <button
                      type="button"
                      className="delete-chip-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecipients(recipients.filter((_, i) => i !== idx));
                      }}
                      title="Remove recipient"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {recipients.length > 3 && (
                  <span className="recipient-green-chip remaining-badge" title={recipients.slice(3).join(", ")}>
                    +{recipients.length - 3}
                  </span>
                )}
                
                <input
                  id="recipientsInput"
                  type="text"
                  placeholder={recipients.length === 0 ? "recipient@example.com" : ""}
                  value={recipientsInput}
                  onChange={handleRecipientsInputChange}
                  onKeyDown={handleRecipientsInputKeyDown}
                  onBlur={handleRecipientsInputBlur}
                  required={recipients.length === 0}
                  className="recipient-text-input"
                />
              </div>
              
              <button
                type="button"
                className="upload-list-btn"
                onClick={() => csvFileInputRef.current?.click()}
                title="Upload CSV / Text lead list"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" className="upload-icon">
                  <path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                </svg>
                Upload List
              </button>
            </div>
          </div>

          {/* Subject Input */}
          <div className="form-group-inline">
            <label htmlFor="subjectInput">Subject</label>
            <input
              id="subjectInput"
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Delay / Throttling limits row */}
          <div className="form-row-throttling">
            <div className="throttle-field">
              <label htmlFor="delayInput">Delay between 2 emails</label>
              <input
                id="delayInput"
                type="text"
                value={delaySecs}
                onChange={(e) => setDelaySecs(e.target.value)}
                placeholder="00"
              />
            </div>
            <div className="throttle-field">
              <label htmlFor="limitInput">Hourly Limit</label>
              <input
                id="limitInput"
                type="text"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(e.target.value)}
                placeholder="00"
              />
            </div>
          </div>

          {/* Schedule Summary Banner */}
          {scheduledLabel !== "Send Immediately" && (
            <div className="schedule-summary-banner">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"
                />
              </svg>
              <span>{scheduledLabel}</span>
              <button
                type="button"
                className="clear-schedule-btn"
                onClick={() => {
                  setStartTime(new Date().toISOString().slice(0, 16));
                  setScheduledLabel("Send Immediately");
                }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Rich Text Editor Simulation */}
          <div className="rich-editor-container">
            <textarea
              className="rich-textarea"
              placeholder="Type Your Reply..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
            
            {/* Editor Toolbar */}
            <div className="rich-editor-toolbar">
              <button type="button" className="toolbar-btn" title="Undo"><span className="btn-icon">↺</span></button>
              <button type="button" className="toolbar-btn" title="Redo"><span className="btn-icon">↻</span></button>
              <div className="toolbar-separator" />
              <button type="button" className="toolbar-btn" title="Text size"><span className="btn-icon">Tᴛ</span></button>
              <div className="toolbar-separator" />
              <button type="button" className="toolbar-btn text-bold" title="Bold">B</button>
              <button type="button" className="toolbar-btn text-italic" title="Italic">I</button>
              <button type="button" className="toolbar-btn text-underline" title="Underline">U</button>
              <div className="toolbar-separator" />
              <button type="button" className="toolbar-btn" title="Align"><span className="btn-icon">≡</span></button>
              <button type="button" className="toolbar-btn" title="Line height"><span className="btn-icon">⇳</span></button>
              <div className="toolbar-separator" />
              <button type="button" className="toolbar-btn" title="Numbered List">1.</button>
              <button type="button" className="toolbar-btn" title="Bulleted List">•</button>
              <button type="button" className="toolbar-btn" title="Indent decrease">«</button>
              <button type="button" className="toolbar-btn" title="Indent increase">»</button>
              <button type="button" className="toolbar-btn" title="Quote">”</button>
              <button type="button" className="toolbar-btn" title="Clean format"><span className="btn-icon">⌧</span></button>
              <button type="button" className="toolbar-btn" title="Strikethrough">S</button>
            </div>
          </div>

          {/* Attachments preview list matching mockup bottom section */}
          {attachments.length > 0 && (
            <div className="compose-attachments-preview-section">
              <div className="attachments-grid">
                {attachments.map((attach, idx) => (
                  <div key={idx} className="attachment-card">
                    <div className="attachment-thumbnail">
                      {attach.previewUrl ? (
                        <img src={attach.previewUrl} alt={attach.name} />
                      ) : (
                        <div className="file-icon-placeholder">📄</div>
                      )}
                    </div>
                    <div className="attachment-info">
                      <span className="attachment-name">{attach.name}</span>
                      <span className="attachment-size">
                        {(attach.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <button
                        type="button"
                        className="remove-attachment-btn"
                        onClick={() => {
                          if (attach.previewUrl) URL.revokeObjectURL(attach.previewUrl);
                          setAttachments(attachments.filter((_, i) => i !== idx));
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
