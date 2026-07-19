import { motion } from "framer-motion"
import { useGetServices } from "@workspace/api-client-react"
import { Truck, Factory, Trash2, Leaf, Box, Settings } from "lucide-react"

// Map string icons from DB to actual lucide components
const iconMap: Record<string, any> = {
  "truck": Truck,
  "factory": Factory,
  "trash2": Trash2,
  "leaf": Leaf,
  "box": Box,
  "settings": Settings,
}

export function ServicesSection() {
  const { data: services, isLoading } = useGetServices()

  const defaultServices = [
    { id: 1, title: "تأجير الحاويات", description: "نوفر حاويات بمقاسات متعددة لتناسب كافة احتياجات مشاريعك الإنشائية أو المنزلية بمرونة عالية في عقود التأجير.", icon: "box" },
    { id: 2, title: "نقل الأنقاض", description: "خدمات نقل وإزالة المخلفات الإنشائية والأنقاض بسرعة واحترافية للحفاظ على نظافة وسلامة مواقع العمل.", icon: "trash2" },
    { id: 3, title: "خدمات المصانع", description: "عقود سنوية لتوريد وتفريغ الحاويات للمصانع والمنشآت الصناعية لضمان استمرارية العمل دون انقطاع.", icon: "factory" },
    { id: 4, title: "الحلول البيئية", description: "نتخلص من النفايات بطرق صديقة للبيئة وفق معايير الجودة المعتمدة في المملكة العربية السعودية.", icon: "leaf" },
  ]

  const displayServices = services && services.length > 0 ? services : defaultServices

  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">خدماتنا المتميزة</h2>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 text-lg">
              نقدم باقة متكاملة من الخدمات اللوجستية التي تلبي احتياجات قطاع المقاولات والأفراد بأعلى معايير الجودة والاحترافية.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayServices.map((service, index) => {
            const Icon = iconMap[service.icon] || Settings

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-gray-50 border border-gray-100 p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:bg-primary overflow-hidden"
              >
                {/* Background decorative element */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 text-secondary pointer-events-none transform translate-x-4 -translate-y-4 scale-150">
                  <Icon size={120} />
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-6 group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                    <Icon size={32} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
