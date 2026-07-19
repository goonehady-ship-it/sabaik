import { useState } from "react"
import { useGetServices, useCreateService, useUpdateService, useDeleteService } from "@workspace/api-client-react"
import type { Service } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Settings, Eye, EyeOff, X, Check } from "lucide-react"

type ServiceForm = {
  title: string
  description: string
  icon: string
  imageUrl: string
  order: number
  isActive: boolean
}

const emptyForm = (): ServiceForm => ({
  title: "",
  description: "",
  icon: "Wrench",
  imageUrl: "",
  order: 0,
  isActive: true,
})

export default function AdminServices() {
  const { data: services = [], refetch } = useGetServices()
  const { mutate: createService, isPending: creating } = useCreateService()
  const { mutate: updateService, isPending: updating } = useUpdateService()
  const { mutate: deleteService } = useDeleteService()

  const [editing, setEditing] = useState<number | "new" | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm())

  const openNew = () => {
    setForm({ ...emptyForm(), order: services.length })
    setEditing("new")
  }

  const openEdit = (service: Service) => {
    setForm({
      title: service.title,
      description: service.description,
      icon: service.icon,
      imageUrl: service.imageUrl ?? "",
      order: service.order,
      isActive: service.isActive,
    })
    setEditing(service.id)
  }

  const handleSave = () => {
    const data = { ...form, imageUrl: form.imageUrl || undefined }
    if (editing === "new") {
      createService({ data }, { onSuccess: () => { refetch(); setEditing(null) } })
    } else if (typeof editing === "number") {
      updateService({ id: editing, data }, { onSuccess: () => { refetch(); setEditing(null) } })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الخدمة؟")) {
      deleteService({ id }, { onSuccess: () => refetch() })
    }
  }

  const toggleActive = (service: Service) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateService({ id: service.id, data: { isActive: !service.isActive } as any }, { onSuccess: () => refetch() })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الخدمات</h2>
        <Button onClick={openNew} className="gap-2">
          <Plus size={16} />
          إضافة خدمة
        </Button>
      </div>

      {/* Form */}
      {editing !== null && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-800">
              {editing === "new" ? "إضافة خدمة جديدة" : "تعديل الخدمة"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">اسم الخدمة *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="اسم الخدمة" dir="rtl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">الأيقونة (Lucide)</label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Wrench" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">الوصف *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف تفصيلي للخدمة"
                rows={3}
                dir="rtl"
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">رابط الصورة</label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">الترتيب</label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">نشط</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={creating || updating} className="gap-2">
                <Check size={16} />
                {creating || updating ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)} className="gap-2">
                <X size={16} />
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      <div className="grid gap-3">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Settings size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-gray-900 truncate">{service.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    service.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {service.isActive ? "نشط" : "مخفي"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => toggleActive(service)} className="text-gray-400 hover:text-gray-700">
                  {service.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(service)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {services.length === 0 && (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-3 text-gray-400">
              <Settings size={48} strokeWidth={1} />
              <p className="text-lg font-medium">لا توجد خدمات بعد</p>
              <Button onClick={openNew} variant="outline" className="gap-2 mt-2"><Plus size={16} /> أضف خدمة</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
