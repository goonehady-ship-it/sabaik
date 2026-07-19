import { motion } from "framer-motion"
import { CheckCircle2, ShieldCheck, Target } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-gray-50 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold mb-6">
              من نحن
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 leading-tight">
              شريكك الموثوق في <br />
              <span className="text-secondary">مشاريعك الإنشائية</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              تأسست شركة سبائك الماسة عام 2018 في قلب العاصمة الرياض، لتنطلق برؤية طموحة نحو ريادة قطاع تأجير الحاويات ونقل الأنقاض. نحن ندرك تماماً أهمية الوقت والجودة في المشاريع الإنشائية، لذا سخرنا كافة إمكانياتنا لتقديم خدمات لوجستية ترتقي لتطلعات عملائنا.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="bg-primary/5 p-3 rounded-lg text-primary shrink-0">
                  <Target size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">رؤيتنا</h4>
                  <p className="text-sm text-gray-600">الريادة في تقديم الحلول البيئية ونقل الأنقاض على مستوى المملكة.</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg text-secondary shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">رسالتنا</h4>
                  <p className="text-sm text-gray-600">تقديم خدمات موثوقة وآمنة تساهم في نجاح مشاريع شركائنا.</p>
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                "أسطول حديث ومجهز بأحدث التقنيات",
                "فريق عمل محترف وذو كفاءة عالية",
                "الالتزام بالمواعيد والموثوقية التامة",
                "أسعار تنافسية تناسب كافة المشاريع"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-secondary" size={20} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] md:aspect-square lg:aspect-[4/5] shadow-2xl">
              <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-multiply"></div>
              {/* Replace with actual high quality construction/container image if available */}
              <img 
                src="/hero1.jpg" 
                alt="Sabaik Almasa Operations" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1541888081622-4917a102c7b5?auto=format&fit=crop&q=80&w=800'
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-primary to-transparent z-20">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl text-white">
                  <p className="font-bold text-2xl mb-2 flex items-center gap-2">
                    <span className="text-secondary">6+</span> سنوات
                  </p>
                  <p className="text-sm text-gray-200">من التميز والنجاح في خدمة قطاع المقاولات في المملكة العربية السعودية.</p>
                </div>
              </div>
            </div>
            
            {/* Decorative frame elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 border-t-4 border-r-4 border-secondary rounded-tr-3xl -z-10 hidden md:block"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border-b-4 border-l-4 border-primary rounded-bl-3xl -z-10 hidden md:block"></div>
          </motion.div>
          
        </div>
      </div>
    </section>
  )
}
