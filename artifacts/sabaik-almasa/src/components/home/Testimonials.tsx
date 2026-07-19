import { motion } from "framer-motion"
import { useGetTestimonials } from "@workspace/api-client-react"
import { Star, Quote } from "lucide-react"

export function Testimonials() {
  const { data: testimonials, isLoading } = useGetTestimonials()

  const defaultTestimonials = [
    {
      id: 1,
      clientName: "م. عبدالله العتيبي",
      company: "شركة إعمار نجد للمقاولات",
      content: "تعاملنا مع سبائك الماسة في عدة مشاريع كبرى، ولمسنا منهم احترافية عالية وسرعة في تلبية الطلبات. تغيير الحاويات يتم في وقته دون تأخير.",
      rating: 5
    },
    {
      id: 2,
      clientName: "خالد السالم",
      company: "عميل فردي - ترميم فيلا",
      content: "طلبت حاوية لترميم منزلي، كان التجاوب سريع جداً والأسعار واضحة ومناسبة مقارنة بالسوق. أنصح بالتعامل معهم.",
      rating: 5
    },
    {
      id: 3,
      clientName: "م. سعيد الدوسري",
      company: "مؤسسة القمة للتشييد",
      content: "أكثر ما يميزهم هو نظافة الحاويات ومظهرها الجيد الذي لا يشوه موقع العمل، بالإضافة إلى التزام السائقين بقواعد السلامة.",
      rating: 4
    }
  ]

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials

  return (
    <section id="testimonials" className="py-24 bg-gray-50 relative">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">قالوا عنا</h2>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 text-lg">
              نفخر بثقة عملائنا وشركائنا، ونسعى دائماً لنكون عند حسن ظنهم.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative"
            >
              <div className="absolute top-6 left-6 text-gray-200">
                <Quote size={60} className="transform rotate-180" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    className={i < testimonial.rating ? "text-secondary fill-secondary" : "text-gray-300"} 
                  />
                ))}
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-8 relative z-10 min-h-[80px]">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  {testimonial.clientName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.clientName}</h4>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
