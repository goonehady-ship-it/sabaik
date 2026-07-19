import { useState } from "react"
import { useGetServiceRequests, useUpdateServiceRequest } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ServiceRequestStatus, ServiceRequestUpdateStatus } from "@workspace/api-client-react"
import { format } from "date-fns"
import { arSA } from "date-fns/locale"

export default function AdminRequests() {
  const [filter, setFilter] = useState<string>("all")
  const { data: requests, refetch } = useGetServiceRequests({ 
    status: filter !== "all" ? filter as any : undefined 
  })
  
  const { mutate: updateReq } = useUpdateServiceRequest()

  const handleStatusChange = (id: number, newStatus: string) => {
    updateReq({ id, data: { status: newStatus as ServiceRequestUpdateStatus } }, {
      onSuccess: () => {
        refetch()
      }
    })
  }

  const statusMap = {
    [ServiceRequestStatus.pending]: { label: "جديد", color: "bg-blue-100 text-blue-700 border-blue-200" },
    [ServiceRequestStatus.in_progress]: { label: "قيد التنفيذ", color: "bg-orange-100 text-orange-700 border-orange-200" },
    [ServiceRequestStatus.completed]: { label: "مكتمل", color: "bg-green-100 text-green-700 border-green-200" },
    [ServiceRequestStatus.cancelled]: { label: "ملغي", color: "bg-red-100 text-red-700 border-red-200" },
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الطلبات</h2>
        <div className="w-48">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الطلبات</SelectItem>
              <SelectItem value={ServiceRequestStatus.pending}>الجديدة</SelectItem>
              <SelectItem value={ServiceRequestStatus.in_progress}>قيد التنفيذ</SelectItem>
              <SelectItem value={ServiceRequestStatus.completed}>المكتملة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-gray-600">
                  <th className="p-4 font-medium">رقم الطلب</th>
                  <th className="p-4 font-medium">العميل</th>
                  <th className="p-4 font-medium">التواصل</th>
                  <th className="p-4 font-medium">الخدمة</th>
                  <th className="p-4 font-medium">التاريخ</th>
                  <th className="p-4 font-medium">الحالة</th>
                  <th className="p-4 font-medium">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {requests?.map(req => (
                  <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="p-4 font-mono">#{req.id}</td>
                    <td className="p-4 font-bold text-gray-900">{req.clientName}</td>
                    <td className="p-4">
                      <div dir="ltr" className="text-right">{req.phone}</div>
                      {req.email && <div className="text-xs text-gray-500">{req.email}</div>}
                    </td>
                    <td className="p-4">
                      <div>{req.serviceType}</div>
                      <div className="text-xs text-gray-500">{req.containerSize}</div>
                    </td>
                    <td className="p-4 text-gray-500">
                      {format(new Date(req.createdAt), 'dd MMM yyyy', { locale: arSA })}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusMap[req.status].color}`}>
                        {statusMap[req.status].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <Select 
                        defaultValue={req.status} 
                        onValueChange={(val) => handleStatusChange(req.id, val)}
                      >
                        <SelectTrigger className="h-8 text-xs w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ServiceRequestStatus.pending}>جديد</SelectItem>
                          <SelectItem value={ServiceRequestStatus.in_progress}>تحديث: قيد التنفيذ</SelectItem>
                          <SelectItem value={ServiceRequestStatus.completed}>تحديث: مكتمل</SelectItem>
                          <SelectItem value={ServiceRequestStatus.cancelled}>تحديث: ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {(!requests || requests.length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      لا توجد طلبات لعرضها
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
