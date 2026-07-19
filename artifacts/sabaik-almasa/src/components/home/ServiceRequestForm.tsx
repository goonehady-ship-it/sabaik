import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { useSubmitServiceRequest } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  clientName: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(9, "رقم الجوال غير صحيح"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal('')),
  serviceType: z.string().min(1, "الرجاء اختيار نوع الخدمة"),
  containerSize: z.string().min(1, "الرجاء اختيار الحجم"),
  location: z.string().min(3, "الموقع مطلوب"),
  duration: z.string().optional(),
  notes: z.string().optional(),
})

export function ServiceRequestForm() {
  const { toast } = useToast()
  const { mutate: submitRequest, isPending } = useSubmitServiceRequest()
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      phone: "",
      email: "",
      serviceType: "",
      containerSize: "",
      location: "",
      duration: "",
      notes: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitRequest({ data: values }, {
      onSuccess: () => {
        setIsSuccess(true)
        form.reset()
        toast({
          title: "تم إرسال طلبك بنجاح!",
          description: "سيتواصل معك فريقنا في أقرب وقت ممكن.",
        })
        setTimeout(() => setIsSuccess(false), 5000)
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "حدث خطأ",
          description: "لم نتمكن من إرسال طلبك. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة.",
        })
      }
    })
  }

  return (
    <section id="request-service" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">اطلب الخدمة الآن</h2>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 text-lg">
              املأ النموذج التالي وسيقوم فريقنا بالتواصل معك لتأكيد الطلب وتحديد موعد التسليم.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100"
          >
            {isSuccess ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">تم الاستلام بنجاح!</h3>
                <p className="text-gray-600">شكراً لثقتك بسبائك الماسة، سنتواصل معك قريباً.</p>
                <Button 
                  variant="outline" 
                  className="mt-8"
                  onClick={() => setIsSuccess(false)}
                >
                  إرسال طلب جديد
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold">الاسم / اسم الشركة <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل الاسم" className="h-12 bg-gray-50 border-gray-200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold">رقم الجوال <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="05xxxxxxxx" className="h-12 bg-gray-50 border-gray-200 text-right" dir="ltr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold">نوع الخدمة <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-gray-50 border-gray-200">
                                <SelectValue placeholder="اختر الخدمة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="تأجير حاويات">تأجير حاويات</SelectItem>
                              <SelectItem value="نقل أنقاض">نقل أنقاض</SelectItem>
                              <SelectItem value="عقود مصانع">عقود مصانع</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="containerSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold">حجم الحاوية <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-gray-50 border-gray-200">
                                <SelectValue placeholder="اختر الحجم" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="20 ياردة">20 ياردة</SelectItem>
                              <SelectItem value="12 ياردة">12 ياردة</SelectItem>
                              <SelectItem value="6 ياردة">6 ياردة</SelectItem>
                              <SelectItem value="غير محدد">غير محدد / أحتاج استشارة</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold">موقع المشروع / الحي <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: الرياض - حي الملقا" className="h-12 bg-gray-50 border-gray-200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold">مدة الإيجار المتوقعة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-gray-50 border-gray-200">
                                <SelectValue placeholder="اختر المدة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="يومي">يومي</SelectItem>
                              <SelectItem value="أسبوعي">أسبوعي</SelectItem>
                              <SelectItem value="شهري">شهري</SelectItem>
                              <SelectItem value="عقد سنوي">عقد سنوي</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">ملاحظات إضافية</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="أي تفاصيل أخرى ترغب بإضافتها..." 
                            className="resize-none bg-gray-50 border-gray-200 min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="w-full h-14 text-lg font-bold bg-secondary hover:bg-secondary/90 text-white shadow-lg"
                  >
                    {isPending ? "جاري الإرسال..." : "إرسال الطلب"}
                  </Button>
                </form>
              </Form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
