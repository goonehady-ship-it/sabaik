import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Package, MessageSquare, Info, CheckCheck, ExternalLink } from "lucide-react"
import { Link } from "wouter"

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

interface Notification {
  id: number
  title: string
  message: string
  type: string
  isRead: boolean
  refId?: number | null
  refType?: string | null
  createdAt: string
}

// ── Sound Engine ──────────────────────────────────────────────────────────────

function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    // Three-note ascending chime
    const notes = [880, 1100, 1320]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = "sine"
      osc.frequency.value = freq

      const t = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.25, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)

      osc.start(t)
      osc.stop(t + 0.35)
    })
  } catch {}
}

// ── Floating Toast ─────────────────────────────────────────────────────────────

interface ToastItem {
  id: string
  notification: Notification
}

function FloatingToast({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, x: -80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -80, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="flex items-start gap-3 bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 w-80 pointer-events-auto"
    >
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
        {toast.notification.type === "service_request" ? (
          <Package size={18} className="text-primary" />
        ) : toast.notification.type === "conversation" ? (
          <MessageSquare size={18} className="text-blue-600" />
        ) : (
          <Info size={18} className="text-gray-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm leading-tight">{toast.notification.title}</p>
        <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{toast.notification.message}</p>
        <p className="text-[10px] text-gray-400 mt-1.5">الآن</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0 -mt-0.5">
        <X size={14} />
      </button>
    </motion.div>
  )
}

// ── Toast Portal ───────────────────────────────────────────────────────────────

export function AdminToastPortal() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Listen for custom events from the notification bell
  useEffect(() => {
    const handler = (e: CustomEvent<Notification>) => {
      const id = crypto.randomUUID()
      setToasts(prev => [...prev.slice(-3), { id, notification: e.detail }])
    }
    window.addEventListener("admin:new-notification" as any, handler)
    return () => window.removeEventListener("admin:new-notification" as any, handler)
  }, [])

  return (
    <div className="fixed bottom-6 left-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <FloatingToast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── Bell Component ────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "الآن"
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `منذ ${hrs} ساعة`
  return `منذ ${Math.floor(hrs / 24)} يوم`
}

function notifIcon(type: string) {
  if (type === "service_request") return <Package size={14} className="text-primary" />
  if (type === "conversation") return <MessageSquare size={14} className="text-blue-600" />
  return <Info size={14} className="text-gray-500" />
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastSeenId, setLastSeenId] = useState<number>(0)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const token = localStorage.getItem("admin_token") || ""

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data: Notification[] = await res.json()
      setNotifications(data)

      // Detect new notifications since last poll
      const maxId = data[0]?.id ?? 0
      if (lastSeenId > 0 && maxId > lastSeenId) {
        // New notifications arrived
        const newOnes = data.filter(n => n.id > lastSeenId)
        newOnes.forEach(n => {
          playNotificationSound()
          window.dispatchEvent(new CustomEvent("admin:new-notification", { detail: n }))
        })
      }
      if (maxId > lastSeenId) setLastSeenId(maxId)
    } catch {}
  }, [token, lastSeenId])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Poll every 8 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 8000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch {}
  }

  const markAllRead = async () => {
    setIsMarkingAll(true)
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {} finally {
      setIsMarkingAll(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className={`relative p-2 rounded-xl transition-all ${
          isOpen ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-100 hover:text-primary"
        }`}
      >
        <Bell size={22} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring when unread */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40" />
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            style={{ transformOrigin: "top right" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-primary" />
                <span className="font-bold text-gray-900 text-sm">الإشعارات</span>
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={isMarkingAll}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} />
                  قراءة الكل
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Bell size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.slice(0, 15).map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 transition-colors cursor-pointer ${
                      !n.isRead ? "bg-primary/4 hover:bg-primary/8" : "hover:bg-gray-50"
                    }`}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === "service_request" ? "bg-primary/10" :
                      n.type === "conversation" ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                      {notifIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-1">
                        <p className={`text-xs font-semibold leading-tight ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}>
                          {n.title}
                        </p>
                        {!n.isRead && <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-1" />}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {n.refType === "service_request" && n.refId && (
                      <Link
                        href="/admin/requests"
                        className="shrink-0 text-gray-300 hover:text-primary mt-1"
                        onClick={() => setIsOpen(false)}
                      >
                        <ExternalLink size={12} />
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-2.5 text-center">
              <Link href="/admin/notifications" onClick={() => setIsOpen(false)} className="text-xs text-primary hover:underline">
                عرض جميع الإشعارات
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
