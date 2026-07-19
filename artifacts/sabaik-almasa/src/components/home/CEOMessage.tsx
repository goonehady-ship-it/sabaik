import { motion } from "framer-motion"
import { Quote } from "lucide-react"

export function CEOMessage() {
  return (
    <section className="py-24 bg-primary text-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-4 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-64 h-64 md:w-80 md:h-80"
            >
              <div className="absolute inset-0 rounded-full border-2 border-secondary/30 scale-105 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border border-secondary scale-110"></div>
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10 bg-white">
                <img 
                  src="/ceo.png" 
                  alt="CEO of Sabaik Almasa" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
                  }}
                />
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Quote size={80} className="absolute -top-10 -right-8 text-white/10 transform rotate-180" />
              
              <h2 className="text-2xl font-bold text-secondary mb-2">كلمة الإدارة</h2>
              <h3 className="text-3xl font-bold mb-6">نبني شراكات تدوم</h3>
              
              <div className="space-y-4 text-lg text-gray-300 leading-relaxed italic mb-8 relative z-10">
                <p>
                  "في سبائك الماسة، لا ننظر إلى عملنا كمجرد تقديم خدمة لوجستية وتأجير حاويات، بل نعتبر أنفسنا شركاء في كل مبنى يُشيد وكل مشروع ينهض على هذه الأرض الطيبة. التزامنا بالجودة والسرعة ليس شعاراً تسويقياً، بل هو التزام أخلاقي مهني بنينا عليه سمعتنا."
                </p>
                <p>
                  "ندرك أن النهضة العمرانية التي تشهدها المملكة تتطلب قطاعاً مسانداً قوياً وموثوقاً، ونحن هنا لنكون جزءاً من هذه النهضة، مسخرين كافة طاقاتنا لخدمتكم."
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-0.5 w-12 bg-secondary"></div>
                <div>
                  <h4 className="font-bold text-xl text-white">المدير العام</h4>
                  <p className="text-secondary text-sm">شركة سبائك الماسة</p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
