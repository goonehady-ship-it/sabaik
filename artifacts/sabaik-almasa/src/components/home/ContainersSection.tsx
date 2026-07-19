import { motion } from "framer-motion"
import { useGetContainers } from "@workspace/api-client-react"
import { Check, Maximize, Weight } from "lucide-react"
import { useServiceRequest } from "@/context/ServiceRequestContext"

export function ContainersSection() {
  const { data: containers, isLoading } = useGetContainers()
  const { openModal } = useServiceRequest()

  const defaultContainers = [
    {
      id: 1,
      name: "حاوية صغيرة",
      size: "12 ياردة",
      capacity: "12 م³",
      description: "مثالية للأعمال الصغيرة والترميم البسيط، تناسب المنازل والمشاريع الصغيرة.",
      features: ["مناسبة للمنازل", "أعمال الترميم البسيط", "سهلة التوصيل", "المساحات الضيقة"],
      pricePerDay: 150,
      imageUrl: "/container1.jpg",
    },
    {
      id: 2,
      name: "حاوية متوسطة",
      size: "20 ياردة",
      capacity: "20 م³",
      description: "مثالية للمشاريع المتوسطة والإنشاءات التجارية.",
      features: ["للمشاريع التجارية", "أعمال الهدم المتوسطة", "سعة أكبر", "توصيل سريع"],
      pricePerDay: 200,
      imageUrl: "/container2.jpg",
    },
    {
      id: 3,
      name: "حاوية مصانع",
      size: "30 ياردة",
      capacity: "30 م³",
      description: "مصممة للمصانع والورش الكبيرة، تتحمل الأوزان الثقيلة.",
      features: ["للمصانع والورش", "تحمل أوزان ثقيلة", "مخلفات صناعية", "حلول متخصصة"],
      pricePerDay: 280,
      imageUrl: "/container3.jpg",
    },
    {
      id: 4,
      name: "حاوية كبيرة",
      size: "40 ياردة",
      capacity: "40 م³",
      description: "للمشاريع الإنشائية الكبرى والمجمعات السكنية.",
      features: ["للمشاريع الكبرى", "أقصى سعة", "مجمعات سكنية", "مشاريع البنية التحتية"],
      pricePerDay: 350,
      imageUrl: "/container4.jpg",
    },
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
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full mb-6" />
            <p className="text-gray-600 text-lg">
              نوفر مقاسات متنوعة تلبي كافة متطلباتك، من الترميمات المنزلية البسيطة حتى المشاريع الإنشائية الضخمة.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayContainers.map((container, index) => {
            // Build the preselect containerSize key matching our bot/modal format
            const containerKey = `${container.name} - ${container.size}`

            return (
              <motion.div
                key={container.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full"
              >
                <div className="relative h-52 overflow-hidden bg-gray-200">
                  <img
                    src={container.imageUrl}
                    alt={container.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1587293852726-59113a968604?auto=format&fit=crop&q=80&w=600"
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-secondary text-white font-bold py-1 px-3 rounded-lg shadow text-sm">
                    {container.pricePerDay} ريال/يوم
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-primary mb-1">{container.name}</h3>

                  <div className="flex gap-3 mb-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Maximize size={13} className="text-secondary" />
                      <span>{container.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Weight size={13} className="text-secondary" />
                      <span>{container.capacity}</span>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mb-4 flex-1">{container.description}</p>

                  <div className="space-y-1.5 mb-5">
                    {(Array.isArray(container.features)
                      ? container.features
                      : typeof container.features === "string"
                      ? JSON.parse(container.features)
                      : []
                    ).map((feature: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <Check size={13} className="text-secondary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => openModal({ serviceType: "تأجير حاويات", containerSize: containerKey, containerName: container.name })}
                    className="w-full text-center bg-primary hover:bg-secondary text-white font-bold py-3 rounded-xl transition-all duration-200 mt-auto text-sm shadow hover:shadow-lg"
                  >
                    اطلب الآن ←
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
