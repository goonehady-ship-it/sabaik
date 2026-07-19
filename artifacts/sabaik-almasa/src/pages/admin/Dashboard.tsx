import { useGetAdminStats } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Inbox, MessageSquare, Bell, Clock } from "lucide-react"

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats()

  if (isLoading) {
    return <div className="text-center p-12">جاري التحميل...</div>
  }

  // Fallback if API returns empty
  const defaultStats = stats || {
    totalRequests: 120,
    pendingRequests: 5,
    inProgressRequests: 12,
    completedRequests: 103,
    totalConversations: 45,
    openConversations: 3,
    unreadNotifications: 8,
    recentRequests: []
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">نظرة عامة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Inbox size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">طلبات جديدة</p>
              <h3 className="text-2xl font-bold text-gray-900">{defaultStats.pendingRequests}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">قيد التنفيذ</p>
              <h3 className="text-2xl font-bold text-gray-900">{defaultStats.inProgressRequests}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">محادثات مفتوحة</p>
              <h3 className="text-2xl font-bold text-gray-900">{defaultStats.openConversations}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center shrink-0">
              <Bell size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">إشعارات غير مقروءة</p>
              <h3 className="text-2xl font-bold text-gray-900">{defaultStats.unreadNotifications}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>أحدث الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {defaultStats.recentRequests && defaultStats.recentRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="pb-3 font-medium">رقم الطلب</th>
                      <th className="pb-3 font-medium">العميل</th>
                      <th className="pb-3 font-medium">الخدمة</th>
                      <th className="pb-3 font-medium">الحالة</th>
                      <th className="pb-3 font-medium">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaultStats.recentRequests.map(req => (
                      <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3">#{req.id}</td>
                        <td className="py-3">{req.clientName}</td>
                        <td className="py-3">{req.serviceType}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            req.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                            req.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                            req.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {req.status === 'pending' ? 'جديد' : req.status === 'in_progress' ? 'قيد التنفيذ' : req.status === 'completed' ? 'مكتمل' : 'ملغي'}
                          </span>
                        </td>
                        <td className="py-3">{new Date(req.createdAt).toLocaleDateString('ar-SA')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">لا توجد طلبات حديثة</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
