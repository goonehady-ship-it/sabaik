import { motion } from "framer-motion"
import { Shield, Clock, Award, Leaf, HeadphonesIcon } from "lucide-react"

export function ValuesSection() {
  const values = [
    {
      title: "الثقة والأمان",
      description: "نلتزم بأعلى معايير السلامة والأمان في كافة عملياتنا لبناء ثقة مستدامة مع عملائنا.",
      icon: Shield
    },
    {
      title: "السرعة والدقة",
      description: "ندرك أهمية الوقت في المشاريع، لذا نحرص على الاستجابة السريعة ودقة المواعيد.",
      icon: Clock
    },
    {
      title: "الجودة العالية",
      description: "نستخدم معدات حديثة وموثوقة لضمان تقديم خدمة تليق باسم سبائك الماسة.",
      icon: Award
    },
    {
      title: "الاستدامة البيئية",
      description: "نعمل بمسؤولية تجاه البيئة من خلال التخلص الآمن من المخلفات وفق الأنظمة.",
      icon: Leaf
    },
    {
      title: "خدمة ما بعد التعاقد",
      description: "دعم مستمر وتواصل فعّال لضمان رضاكم التام طوال فترة العمل.",
      icon: HeadphonesIcon
    }
  ]

  return (
    <section id="values" className="py-24 bg-primary text-white relative overflow-hidden">
      {/* Abstract Background pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">قيمنا الأساسية</h2>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full mb-6"></div>
            <p className="text-gray-300 text-lg">
              المبادئ التي تقود عملياتنا وتضمن استمرارية تميزنا في قطاع الخدمات اللوجستية.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors text-center group"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary/20 text-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
