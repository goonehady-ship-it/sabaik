import { motion } from "framer-motion"
import { useGetContainers } from "@workspace/api-client-react"
import { Check, Maximize, Weight } from "lucide-react"

export function ContainersSection() {
  const { data: containers, isLoading } = useGetContainers()

  const defaultContainers = [
    {
      id: 1,
      name: "حاوية مقاس 20 ياردة",
      size: "20 ياردة مكعبة",
      capacity: "حوالي 15 طن",
      description: "الخيار الأمثل للمشاريع الإنشائية الكبيرة وإزالة أنقاض الهدم الواسعة.",
      features: ["باب خلفي لسهولة التعبئة", "مناسبة للأنقاض الثقيلة", "تتحمل الظروف القاسية"],
      pricePerDay: 250,
      imageUrl: "/container1.jpg"
    },
    {
      id: 2,
      name: "حاوية مقاس 12 ياردة",
      size: "12 ياردة مكعبة",
      capacity: "حوالي 8 طن",
      description: "مناسبة للترميمات المتوسطة ومخلفات الحدائق والبناء التجاري.",
      features: ["حجم مثالي للمساحات الضيقة", "سهلة النقل والتنزيل", "مناسبة للنفايات التجارية"],
      pricePerDay: 180,
      imageUrl: "/container2.jpg"
    },
    {
      id: 3,
      name: "حاوية مقاس 6 ياردة",
      size: "6 ياردة مكعبة",
      capacity: "حوالي 4 طن",
      description: "عملية جداً للاستخدامات السكنية والترميمات الخفيفة داخل الأحياء.",
      features: ["مناسبة للأحياء السكنية", "لا تعيق حركة المرور", "مثالية للترميم الداخلي"],
      pricePerDay: 120,
      imageUrl: "/container3.jpg"
    }
  ]

  const displayContainers = containers && containers.length > 0 ? containers : defaultContainers

  return (
    <section id="containers" className="py-24 bg-gray-50 relative">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">أسطول الحاويات</h2>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 text-lg">
              نوفر مقاسات متنوعة تلبي كافة متطلباتك، من الترميمات المنزلية البسيطة وحتى المشاريع الإنشائية الضخمة.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayContainers.map((container, index) => (
            <motion.div
              key={container.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full"
            >
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <img 
                  src={container.imageUrl} 
                  alt={container.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1587293852726-59113a968604?auto=format&fit=crop&q=80&w=600'
                  }}
                />
                <div className="absolute top-4 right-4 bg-secondary text-white font-bold py-1 px-3 rounded-md shadow-md">
                  {container.pricePerDay} ريال / يوم
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-primary mb-3">{container.name}</h3>
                
                <div className="flex gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Maximize size={16} className="text-secondary" />
                    <span>{container.size}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Weight size={16} className="text-secondary" />
                    <span>{container.capacity}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 flex-1">
                  {container.description}
                </p>
                
                <div className="space-y-2 mb-8">
                  {container.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-secondary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <a 
                  href={`/#request-service?size=${encodeURIComponent(container.size)}`}
                  className="w-full block text-center bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-colors mt-auto"
                >
                  اطلب الآن
                </a>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
