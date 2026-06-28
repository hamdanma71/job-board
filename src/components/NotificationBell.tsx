"use client";

import { useState, useEffect } from "react";
import { useT } from "@/components/I18nProvider";

export default function NotificationBell() {
  const t = useT();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        // Reconcile from server so the badge stays accurate across tabs/sessions.
        setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll so new notifications "light up" the bell without a full page reload.
    const interval = setInterval(loadNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      setUnreadCount(0); // optimistic; reconciled on next poll
      try {
        await fetch("/api/notifications", { method: "PUT" });
      } catch (e) {
        // On failure, re-sync so the badge reflects real DB state.
        loadNotifications();
      }
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button 
        onClick={handleOpen}
        style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", position: "relative" }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: "-5px", insetInlineStart: "-5px", backgroundColor: "#ef4444", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "0.7rem", fontWeight: "bold" }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{ position: "absolute", top: "100%", insetInlineStart: 0, width: "300px", backgroundColor: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", zIndex: 50, maxHeight: "400px", overflowY: "auto" }}>
          <h4 style={{ padding: "1rem", borderBottom: "1px solid var(--border-light)", fontWeight: "bold", margin: 0 }}>{t("bell.title")}</h4>
          {notifications.length === 0 ? (
            <p className="text-muted" style={{ padding: "1rem", textAlign: "center", fontSize: "0.9rem" }}>{t("bell.empty")}</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {notifications.map(n => (
                <li key={n.id} style={{ padding: "1rem", borderBottom: "1px solid var(--border-light)", backgroundColor: n.isRead ? "transparent" : "var(--surface-hover)" }}>
                  <h5 style={{ fontWeight: "bold", fontSize: "0.95rem", marginBottom: "0.2rem" }}>{n.title}</h5>
                  <p style={{ fontSize: "0.85rem", margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                  <span className="text-muted" style={{ fontSize: "0.7rem", marginTop: "0.5rem", display: "block" }}>
                    {new Date(n.createdAt).toLocaleDateString("ar-SA")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
