import { useEffect } from "react"
import { useLocation, Link, useRoute } from "wouter"
import { useGetMe } from "@workspace/api-client-react"
import { 
  LayoutDashboard, 
  Inbox, 
  MessageSquare, 
  Bell, 
  LogOut, 
  Settings,
  Image as ImageIcon,
  Box,
  Star,
  Users
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation()
  
  // Quick auth check using localStorage token
  // In a real app we'd use the useGetMe hook to validate
  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      setLocation("/admin/login")
    }
  }, [setLocation])

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    setLocation("/admin/login")
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "لوحة القيادة" },
    { href: "/admin/requests", icon: Inbox, label: "الطلبات" },
    { href: "/admin/conversations", icon: MessageSquare, label: "المحادثات" },
    { href: "/admin/notifications", icon: Bell, label: "الإشعارات" },
    { href: "/admin/slides", icon: ImageIcon, label: "الشرائح" },
    { href: "/admin/services", icon: Settings, label: "الخدمات" },
    { href: "/admin/containers", icon: Box, label: "الحاويات" },
    { href: "/admin/testimonials", icon: Star, label: "الشهادات" },
    { href: "/admin/partners", icon: Users, label: "الشركاء" },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col shrink-0 fixed inset-y-0 right-0 z-20">
        <div className="p-6 border-b border-white/10">
          <img src="/logo.png" alt="Sabaik Admin" className="h-10 w-auto mb-2 brightness-0 invert" />
          <h2 className="text-xl font-bold">لوحة الإدارة</h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const [isActive] = useRoute(item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? "bg-secondary text-primary font-bold" 
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-right text-gray-300 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-64 min-h-screen">
        <header className="bg-white shadow-sm h-16 flex items-center px-8 justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">إدارة سبائك الماسة</h1>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-sm text-secondary hover:underline">
              عرض الموقع
            </Link>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              A
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
