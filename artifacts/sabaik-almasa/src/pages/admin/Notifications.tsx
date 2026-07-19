import { useState } from "react"
import { useGetNotifications, useMarkNotificationRead } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, Package, MessageSquare, Settings, Inbox } from "lucide-react"
import { format } from "date-fns"
import { arSA } from "date-fns/locale"

const typeConfig: Record<string, { label: string; icon: typeof Bell; color: string }> = {
  request: { label: "طلب خدمة", icon: Inbox, color: "bg-blue-100 text-blue-700" },
  message: { label: "رسالة", icon: MessageSquare, color: "bg-green-100 text-green-700" },
  system: { label: "نظام", icon: Settings, color: "bg-gray-100 text-gray-700" },
  container: { label: "حاوية", icon: Package, color: "bg-orange-100 text-orange-700" },
}

export default function AdminNotifications() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const { data: notifications = [], refetch } = useGetNotifications()
  const { mutate: markRead } = useMarkNotificationRead()

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead
    if (filter === "read") return n.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkRead = (id: number) => {
    markRead({ id }, { onSuccess: () => refetch() })
  }

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead)
    for (const n of unread) {
      await new Promise<void>((resolve) =>
        markRead({ id: n.id }, { onSuccess: () => resolve() })
      )
    }
    refetch()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">الإشعارات</h2>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {unreadCount} جديد
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
            <CheckCheck size={16} />
            تعليم الكل كمقروء
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: `الكل (${notifications.length})` },
          { key: "unread", label: `غير مقروء (${unreadCount})` },
          { key: "read", label: "مقروء" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <Bell size={48} strokeWidth={1} />
            <p className="text-lg font-medium">لا توجد إشعارات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => {
            const config = typeConfig[notification.type] ?? typeConfig.system!
            const Icon = config.icon
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl border p-5 flex items-start gap-4 transition-all ${
                  !notification.isRead
                    ? "border-primary/30 shadow-sm shadow-primary/5"
                    : "border-gray-100"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full mr-auto ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(notification.createdAt), "dd MMMM yyyy — HH:mm", { locale: arSA })}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkRead(notification.id)}
                    className="text-primary hover:text-primary hover:bg-primary/5 shrink-0"
                  >
                    تعليم كمقروء
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
