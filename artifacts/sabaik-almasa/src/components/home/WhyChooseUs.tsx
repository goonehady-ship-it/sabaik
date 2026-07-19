import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

export function WhyChooseUs() {
  const points = [
    "سرعة استجابة لا مثيل لها عبر منصات التواصل",
    "تغطية جغرافية شاملة لمدينة الرياض وضواحيها",
    "فريق عمل مدرب للتعامل مع كافة المواقع والتحديات",
    "أسطول سيارات حديث لضمان عدم تعطل العمل",
    "أسعار شفافة وباقات تأجير مرنة",
    "التزام تام باشتراطات البلدية والجهات المعنية",
    "خدمة عملاء على مدار الساعة",
    "إصدار شهادات الإتلاف الرسمية",
    "تقييم مستمر لجودة الخدمة لضمان رضا العملاء"
  ]

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 relative"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative">
              <img 
                src="/hero2.jpg" 
                alt="Why choose us" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800'
                }}
              />
              <div className="absolute inset-0 bg-primary/20"></div>
              
              {/* Floating badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-8 right-8 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center text-secondary">
                  <span className="font-bold text-xl">1#</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">الخيار الأول</p>
                  <p className="text-sm text-gray-500">للمقاولين في الرياض</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
                لماذا تختار <span className="text-secondary">سبائك الماسة؟</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                نحن لا نقدم مجرد حاويات، بل نقدم حلاً متكاملاً يزيل عنك عبء التفكير في المخلفات لتتفرغ لإنجاز مشروعك.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {points.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100"
                  >
                    <CheckCircle className="text-secondary shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-800 text-sm font-medium">{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
