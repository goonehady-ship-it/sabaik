import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, MapPin, Navigation, CheckCircle, Package, Truck, Factory, Leaf, Phone, User, Loader2, AlertCircle, Building2, Mail, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useServiceRequest } from "@/context/ServiceRequestContext"

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { id: "تأجير حاويات", label: "تأجير حاويات", icon: Package, desc: "حاويات بأحجام مختلفة للبناء والترميم", color: "from-blue-500/20 to-blue-600/10 border-blue-200" },
  { id: "نقل الأنقاض والردم", label: "نقل الأنقاض والردم", icon: Truck, desc: "نقل المخلفات إلى مواقع الردم المعتمدة", color: "from-amber-500/20 to-amber-600/10 border-amber-200" },
  { id: "خدمات المصانع والورش", label: "خدمات المصانع والورش", icon: Factory, desc: "حلول متخصصة للمنشآت الصناعية", color: "from-purple-500/20 to-purple-600/10 border-purple-200" },
  { id: "الحلول البيئية", label: "الحلول البيئية", icon: Leaf, desc: "خدمات صديقة للبيئة — رؤية 2030", color: "from-green-500/20 to-green-600/10 border-green-200" },
]

const CONTAINERS = [
  { id: "حاوية صغيرة - 12 ياردة", name: "حاوية صغيرة", size: "12 ياردة", price: 150, image: "/container1.jpg", best: "الترميم والمنازل" },
  { id: "حاوية متوسطة - 20 ياردة", name: "حاوية متوسطة", size: "20 ياردة", price: 200, image: "/container2.jpg", best: "المشاريع التجارية" },
  { id: "حاوية مصانع - 30 ياردة", name: "حاوية مصانع", size: "30 ياردة", price: 280, image: "/container3.jpg", best: "المصانع والورش" },
  { id: "حاوية كبيرة - 40 ياردة", name: "حاوية كبيرة", size: "40 ياردة", price: 350, image: "/container4.jpg", best: "المشاريع الكبرى" },
]

// ─── Location Picker ──────────────────────────────────────────────────────────

function LocationPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [gpsState, setGpsState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showMap, setShowMap] = useState(false)

  const getGPS = () => {
    if (!navigator.geolocation) {
      setGpsState("error")
      return
    }
    setGpsState("loading")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6)
        const lng = pos.coords.longitude.toFixed(6)
        setCoords({ lat: +lat, lng: +lng })
        setGpsState("success")
        setShowMap(true)
        onChange(`إحداثيات GPS: ${lat}, ${lng} (الرياض)`)
      },
      () => setGpsState("error"),
      { timeout: 10000 }
    )
  }

  const mapUrl = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.008},${coords.lat - 0.008},${coords.lng + 0.008},${coords.lat + 0.008}&layer=mapnik&marker=${coords.lat},${coords.lng}`
    : null

  const mapsShareUrl = coords
    ? `https://maps.google.com/maps?q=${coords.lat},${coords.lng}`
    : null

  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="مثال: الرياض - حي الملقا، شارع الأمير محمد..."
          className="pr-10 h-12 bg-gray-50 border-gray-200 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getGPS}
          disabled={gpsState === "loading"}
          className="flex items-center gap-2 text-primary border-primary/30 hover:bg-primary hover:text-white h-9 text-xs flex-1"
        >
          {gpsState === "loading" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Navigation size={14} />
          )}
          {gpsState === "loading" ? "جاري تحديد موقعك..." : "تحديد موقعي تلقائياً 📍"}
        </Button>

        {showMap && mapsShareUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(mapsShareUrl, "_blank")}
            className="h-9 text-xs px-3 border-green-300 text-green-700 hover:bg-green-50"
          >
            فتح الخريطة
          </Button>
        )}
      </div>

      {gpsState === "error" && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} /> تعذّر الحصول على موقعك. أدخل العنوان يدوياً.
        </p>
      )}

      {gpsState === "success" && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle size={12} /> تم تحديد موقعك بنجاح
        </p>
      )}

      {showMap && mapUrl && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 180 }}
          className="rounded-xl overflow-hidden border border-gray-200 shadow-sm"
        >
          <iframe
            src={mapUrl}
            width="100%"
            height="180"
            className="block"
            title="موقعك على الخريطة"
            loading="lazy"
          />
        </motion.div>
      )}
    </div>
  )
}

// ─── Step Indicators ──────────────────────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-1 flex-1">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < current ? "bg-secondary" : i === current ? "bg-primary" : "bg-gray-200"}`} />
        </div>
      ))}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

type Step = "service" | "container" | "location" | "personal" | "success"

interface FormData {
  serviceType: string
  containerSize: string
  location: string
  clientName: string
  organization: string
  phone: string
  email: string
  notes: string
}

export function ServiceRequestModal() {
  const { isOpen, preselect, closeModal } = useServiceRequest()
  const [step, setStep] = useState<Step>("service")
  const [form, setForm] = useState<FormData>({
    serviceType: "",
    containerSize: "",
    location: "",
    clientName: "",
    organization: "",
    phone: "",
    email: "",
    notes: "",
  })
  const [orderId, setOrderId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Apply preselection when modal opens
  useEffect(() => {
    if (isOpen) {
      const newForm: FormData = {
        serviceType: preselect.serviceType || "",
        containerSize: preselect.containerSize || "",
        location: "",
        clientName: "",
        organization: "",
        phone: "",
        email: "",
        notes: "",
      }
      setForm(newForm)
      setErrors({})

      if (preselect.serviceType) {
        if (preselect.serviceType === "تأجير حاويات") {
          setStep(preselect.containerSize ? "location" : "container")
        } else {
          setStep("location")
        }
      } else {
        setStep("service")
      }
      setOrderId(null)
    }
  }, [isOpen, preselect])

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const totalSteps = form.serviceType === "تأجير حاويات" ? 4 : 3
  const stepIndex = (() => {
    if (step === "service") return 0
    if (step === "container") return 1
    if (step === "location") return form.serviceType === "تأجير حاويات" ? 2 : 1
    if (step === "personal") return form.serviceType === "تأجير حاويات" ? 3 : 2
    return totalSteps
  })()

  const goBack = () => {
    if (step === "container") setStep("service")
    else if (step === "location") setStep(form.serviceType === "تأجير حاويات" ? "container" : "service")
    else if (step === "personal") setStep("location")
  }

  const handleSelectService = (id: string) => {
    setForm(f => ({ ...f, serviceType: id, containerSize: "" }))
    if (id === "تأجير حاويات") setStep("container")
    else setStep("location")
  }

  const handleSelectContainer = (id: string) => {
    setForm(f => ({ ...f, containerSize: id }))
    setStep("location")
  }

  const handleLocationNext = () => {
    if (!form.location.trim()) {
      setErrors({ location: "الرجاء إدخال موقع المشروع" })
      return
    }
    setErrors({})
    setStep("personal")
  }

  const handleSubmit = async () => {
    const errs: Partial<FormData> = {}
    if (!form.clientName.trim()) errs.clientName = "الاسم مطلوب"
    if (form.phone.trim().length < 9) errs.phone = "رقم الجوال غير صحيح"
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsSubmitting(true)
    try {
      const notesText = [
        form.organization ? `الجهة: ${form.organization}` : "",
        form.notes ? `ملاحظات: ${form.notes}` : "",
        "طلب عبر نموذج الموقع",
      ].filter(Boolean).join(" | ")

      const res = await fetch(`${API_BASE}/api/service-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.clientName,
          phone: form.phone,
          email: form.email || undefined,
          serviceType: form.serviceType,
          containerSize: form.containerSize || null,
          location: form.location,
          notes: notesText,
        }),
      })
      const data = await res.json()
      setOrderId(data.id)
      setStep("success")
    } catch {
      setErrors({ phone: "حدث خطأ في الإرسال. حاول مرة أخرى." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    closeModal()
    setTimeout(() => {
      setStep("service")
      setForm({ serviceType: "", containerSize: "", location: "", clientName: "", organization: "", phone: "", email: "", notes: "" })
      setErrors({})
      setOrderId(null)
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {step !== "service" && step !== "success" && (
                  <button onClick={goBack} className="text-white/70 hover:text-white p-1">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="font-bold text-base">
                    {step === "service" && "اطلب الخدمة الآن"}
                    {step === "container" && "اختر حجم الحاوية"}
                    {step === "location" && "موقع المشروع"}
                    {step === "personal" && "بياناتك الشخصية"}
                    {step === "success" && "تم إرسال الطلب! 🎉"}
                  </h2>
                  <p className="text-white/60 text-xs">سبائك الماسة للحاويات — الرياض</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Progress */}
            {step !== "success" && (
              <div className="px-6 pt-4 shrink-0">
                <StepBar current={stepIndex} total={totalSteps} />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <AnimatePresence mode="wait">
                {/* ── Step 1: Service Type ── */}
                {step === "service" && (
                  <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <p className="text-gray-500 text-sm mb-4">اختر نوع الخدمة التي تحتاجها:</p>
                    <div className="grid grid-cols-1 gap-3">
                      {SERVICE_TYPES.map((s) => {
                        const Icon = s.icon
                        return (
                          <motion.button
                            key={s.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectService(s.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-l ${s.color} text-right transition-all hover:shadow-md`}
                          >
                            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                              <Icon size={22} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-sm">{s.label}</p>
                              <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                            </div>
                            <ChevronRight size={18} className="text-gray-400 shrink-0" />
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Container Select ── */}
                {step === "container" && (
                  <motion.div key="container" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <p className="text-gray-500 text-sm mb-4">اختر الحجم المناسب لمشروعك:</p>
                    {CONTAINERS.map((c) => (
                      <motion.button
                        key={c.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectContainer(c.id)}
                        className={`w-full flex gap-3 rounded-2xl border overflow-hidden text-right transition-all hover:shadow-md hover:border-primary/40 ${
                          form.containerSize === c.id ? "border-primary shadow-md ring-2 ring-primary/20" : "border-gray-100 bg-white"
                        }`}
                      >
                        <div className="w-24 h-24 shrink-0 overflow-hidden">
                          <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 py-3 pl-3 pr-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-sm text-gray-900">{c.name}</p>
                              <p className="text-xs text-gray-500">{c.size}</p>
                            </div>
                            <div className="text-left pl-3">
                              <span className="text-primary font-black text-base">{c.price}</span>
                              <span className="text-[10px] text-gray-400 block -mt-0.5">ريال/يوم</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-secondary font-semibold mt-1.5">✓ الأنسب: {c.best}</p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* ── Step 3: Location ── */}
                {step === "location" && (
                  <motion.div key="location" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 mb-4">
                      <p className="text-primary font-semibold text-sm">
                        {form.serviceType}
                        {form.containerSize && <span className="text-gray-500 font-normal"> · {form.containerSize.split(" - ")[0]}</span>}
                      </p>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">أين تحتاج إيصال الخدمة؟</p>
                    <LocationPicker value={form.location} onChange={(v) => setForm(f => ({ ...f, location: v }))} />
                    {errors.location && <p className="text-red-500 text-xs mt-2">{errors.location}</p>}
                    <Button onClick={handleLocationNext} className="w-full mt-4 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
                      التالي
                    </Button>
                  </motion.div>
                )}

                {/* ── Step 4: Personal Info ── */}
                {step === "personal" && (
                  <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-sm space-y-1">
                      <p className="flex gap-2"><span className="text-gray-400">الخدمة:</span><span className="font-medium text-gray-800">{form.serviceType}</span></p>
                      {form.containerSize && <p className="flex gap-2"><span className="text-gray-400">الحاوية:</span><span className="font-medium text-gray-800">{form.containerSize.split(" - ")[0]}</span></p>}
                      <p className="flex gap-2"><span className="text-gray-400">الموقع:</span><span className="font-medium text-gray-800 truncate">{form.location}</span></p>
                    </div>

                    {/* الاسم */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <User size={14} className="inline ml-1 text-primary" />الاسم *
                      </label>
                      <Input
                        value={form.clientName}
                        onChange={(e) => setForm(f => ({ ...f, clientName: e.target.value }))}
                        placeholder="مثال: أحمد محمد"
                        className="h-12 bg-gray-50 border-gray-200"
                      />
                      {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                    </div>

                    {/* اسم الجهة */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <Building2 size={14} className="inline ml-1 text-primary" />اسم الجهة التابع لها
                        <span className="text-gray-400 font-normal text-xs mr-1">(اختياري)</span>
                      </label>
                      <Input
                        value={form.organization}
                        onChange={(e) => setForm(f => ({ ...f, organization: e.target.value }))}
                        placeholder="مثال: شركة الإنشاءات الحديثة"
                        className="h-12 bg-gray-50 border-gray-200"
                      />
                    </div>

                    {/* الجوال */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <Phone size={14} className="inline ml-1 text-primary" />الجوال *
                      </label>
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="05XXXXXXXX"
                        dir="ltr"
                        type="tel"
                        className="h-12 bg-gray-50 border-gray-200 text-left"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* البريد الإلكتروني */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <Mail size={14} className="inline ml-1 text-primary" />البريد الإلكتروني
                        <span className="text-gray-400 font-normal text-xs mr-1">(اختياري)</span>
                      </label>
                      <Input
                        value={form.email}
                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="example@email.com"
                        dir="ltr"
                        type="email"
                        className="h-12 bg-gray-50 border-gray-200 text-left"
                      />
                    </div>

                    {/* العنوان التفصيلي */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <MapPin size={14} className="inline ml-1 text-primary" />العنوان التفصيلي
                        <span className="text-gray-400 font-normal text-xs mr-1">(اختياري)</span>
                      </label>
                      <Input
                        value={form.location}
                        onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                        placeholder="الحي، الشارع، رقم المبنى..."
                        className="h-12 bg-gray-50 border-gray-200"
                      />
                    </div>

                    {/* ملاحظات */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <FileText size={14} className="inline ml-1 text-primary" />ملاحظات
                        <span className="text-gray-400 font-normal text-xs mr-1">(اختياري)</span>
                      </label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="أي تفاصيل إضافية تودّ إضافتها..."
                        rows={3}
                        className="w-full px-3 py-3 text-sm rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
                      />
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-secondary hover:bg-secondary/90 text-white font-bold text-base rounded-xl shadow-lg mt-2"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> جاري الإرسال...</span>
                      ) : (
                        "إرسال الطلب 📤"
                      )}
                    </Button>

                    <p className="text-center text-xs text-gray-400">
                      سيتواصل معك فريقنا خلال ساعات قليلة على رقمك
                    </p>
                  </motion.div>
                )}

                {/* ── Step 5: Success ── */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-200"
                    >
                      <CheckCircle size={40} className="text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-black text-gray-900 mb-2">تم استلام طلبك!</h3>

                    <div className="bg-primary/5 border border-primary/15 rounded-2xl px-5 py-4 mb-5 inline-block w-full">
                      <p className="text-gray-500 text-xs mb-1">رقم طلبك</p>
                      <p className="text-4xl font-black text-primary">#{orderId}</p>
                    </div>

                    <div className="text-right bg-gray-50 rounded-2xl p-4 space-y-2 text-sm mb-5">
                      <p><span className="text-gray-400">الخدمة: </span><span className="font-semibold">{form.serviceType}</span></p>
                      {form.containerSize && <p><span className="text-gray-400">الحاوية: </span><span className="font-semibold">{form.containerSize.split(" - ")[0]}</span></p>}
                      <p><span className="text-gray-400">الموقع: </span><span className="font-semibold">{form.location}</span></p>
                      <p><span className="text-gray-400">جوالك: </span><span className="font-semibold" dir="ltr">{form.phone}</span></p>
                    </div>

                    <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                      سيتواصل معك فريق سبائك الماسة خلال ساعات قليلة
                      <br />
                      <span className="text-primary font-semibold">📞 0555888767 / 0580595555</span>
                    </p>

                    <Button
                      onClick={handleClose}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                    >
                      إغلاق
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
