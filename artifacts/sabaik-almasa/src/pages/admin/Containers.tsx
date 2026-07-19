import { useState } from "react"
import { useGetContainers, useCreateContainer, useUpdateContainer, useDeleteContainer } from "@workspace/api-client-react"
import type { Container } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Box, Eye, EyeOff, X, Check } from "lucide-react"

type ContainerForm = {
  name: string
  size: string
  capacity: string
  description: string
  features: string
  pricePerDay: string
  imageUrl: string
  order: number
  isActive: boolean
}

const emptyForm = (): ContainerForm => ({
  name: "",
  size: "",
  capacity: "",
  description: "",
  features: "",
  pricePerDay: "",
  imageUrl: "",
  order: 0,
  isActive: true,
})

const toPayload = (f: ContainerForm) => ({
  name: f.name,
  size: f.size,
  capacity: f.capacity,
  description: f.description,
  features: f.features.split("\n").map((s) => s.trim()).filter(Boolean),
  pricePerDay: parseFloat(f.pricePerDay) || 0,
  imageUrl: f.imageUrl,
  order: f.order,
  isActive: f.isActive,
})

export default function AdminContainers() {
  const { data: containers = [], refetch } = useGetContainers()
  const { mutate: createContainer, isPending: creating } = useCreateContainer()
  const { mutate: updateContainer, isPending: updating } = useUpdateContainer()
  const { mutate: deleteContainer } = useDeleteContainer()

  const [editing, setEditing] = useState<number | "new" | null>(null)
  const [form, setForm] = useState<ContainerForm>(emptyForm())

  const openNew = () => {
    setForm({ ...emptyForm(), order: containers.length })
    setEditing("new")
  }

  const openEdit = (c: Container) => {
    setForm({
      name: c.name,
      size: c.size,
      capacity: c.capacity,
      description: c.description,
      features: Array.isArray(c.features) ? c.features.join("\n") : "",
      pricePerDay: String(c.pricePerDay),
      imageUrl: c.imageUrl,
      order: c.order,
      isActive: c.isActive,
    })
    setEditing(c.id)
  }

  const handleSave = () => {
    const payload = toPayload(form)
    if (editing === "new") {
      createContainer({ data: payload }, { onSuccess: () => { refetch(); setEditing(null) } })
    } else if (typeof editing === "number") {
      updateContainer({ id: editing, data: payload }, { onSuccess: () => { refetch(); setEditing(null) } })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الحاوية؟")) {
      deleteContainer({ id }, { onSuccess: () => refetch() })
    }
  }

  const toggleActive = (c: Container) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateContainer({ id: c.id, data: { isActive: !c.isActive } as any }, { onSuccess: () => refetch() })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الحاويات</h2>
        <Button onClick={openNew} className="gap-2">
          <Plus size={16} />
          إضافة حاوية
        </Button>
      </div>

      {/* Form */}
      {editing !== null && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-800">
              {editing === "new" ? "إضافة حاوية جديدة" : "تعديل الحاوية"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">اسم الحاوية *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="حاوية متوسطة" dir="rtl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">الحجم *</label>
                <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="6 م³" dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">الطاقة الاستيعابية</label>
                <Input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="للمشاريع المتوسطة" dir="rtl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">السعر اليومي (ر.س) *</label>
                <Input type="number" value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} placeholder="200" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">الوصف *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف تفصيلي للحاوية"
                rows={2}
                dir="rtl"
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">المميزات (سطر لكل ميزة)</label>
              <textarea
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder={"ميزة أولى\nميزة ثانية\nميزة ثالثة"}
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
            {form.imageUrl && (
              <div className="rounded-xl overflow-hidden h-32 bg-gray-100">
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
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

      {/* Containers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {containers.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            {c.imageUrl && (
              <div className="h-36 bg-gray-100 overflow-hidden">
                <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{c.name}</h3>
                  <p className="text-sm text-primary font-medium">{c.size} — {c.capacity}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-gray-900">{c.pricePerDay} ر.س<span className="text-xs text-gray-400 font-normal">/يوم</span></span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {c.isActive ? "نشط" : "مخفي"}
                  </span>
                </div>
              </div>
              {Array.isArray(c.features) && c.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {c.features.map((f, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Button variant="ghost" size="sm" onClick={() => toggleActive(c)} className="gap-1.5 text-gray-500">
                  {c.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  {c.isActive ? "إخفاء" : "إظهار"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="gap-1.5 text-blue-500 hover:bg-blue-50">
                  <Pencil size={14} /> تعديل
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="gap-1.5 text-red-400 hover:bg-red-50 mr-auto">
                  <Trash2 size={14} /> حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {containers.length === 0 && (
          <div className="col-span-2">
            <Card>
              <CardContent className="py-16 flex flex-col items-center gap-3 text-gray-400">
                <Box size={48} strokeWidth={1} />
                <p className="text-lg font-medium">لا توجد حاويات بعد</p>
                <Button onClick={openNew} variant="outline" className="gap-2 mt-2"><Plus size={16} /> أضف حاوية</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
