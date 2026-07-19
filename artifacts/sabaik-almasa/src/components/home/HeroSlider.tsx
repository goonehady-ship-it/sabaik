import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useGetSlides } from "@workspace/api-client-react"
import { useServiceRequest } from "@/context/ServiceRequestContext"

export function HeroSlider() {
  const { data: slides, isLoading } = useGetSlides()
  const [currentIndex, setCurrentIndex] = useState(0)
  const { openModal } = useServiceRequest()

  const displaySlides = slides && slides.length > 0 ? slides : [
    {
      id: 1,
      title: "أسطول النقل الثقيل — القوة التي تُنجز",
      subtitle: "شاحناتنا المجهزة بأنظمة رفع متطورة تنقل حاوياتكم بدقة واحترافية إلى أي موقع في الرياض",
      imageUrl: "/hero1.jpg",
      ctaText: "اطلب الخدمة الآن",
    },
    {
      id: 2,
      title: "فريق متكامل وأسطول لا يتوقف",
      subtitle: "كوادر بشرية محترفة تقود أحدث شاحنات مرسيدس الثقيلة — جاهزون على مدار الأسبوع لخدمة مشاريعكم",
      imageUrl: "/hero2.jpg",
      ctaText: "تعرف على فريقنا",
    },
    {
      id: 3,
      title: "اتصل الآن — نصل إليكم فوراً",
      subtitle: "حاوياتنا المُبرندة في كل أرجاء الرياض تضمن لكم خدمة سريعة وموثوقة لنقل الأنقاض والمخلفات",
      imageUrl: "/hero3.jpg",
      ctaText: "اتصل بنا الآن",
    },
    {
      id: 4,
      title: "مرسيدس أكتروس — حيث تبدأ الجودة",
      subtitle: "نمتلك أسطولاً من أقوى شاحنات النقل الثقيل في المملكة لضمان تنفيذ مشاريعكم بأعلى مستوى",
      imageUrl: "/hero4.jpg",
      ctaText: "شاهد أسطولنا",
    },
  ]

  useEffect(() => {
    if (displaySlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [displaySlides.length])

  if (isLoading) {
    return (
      <div className="h-[100dvh] w-full bg-primary flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-primary">
      {displaySlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="absolute inset-0">
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect fill="%230A192F" width="100%" height="100%"/></svg>'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-black/40" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="container mx-auto px-4 md:px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: index === currentIndex ? 1 : 0, y: index === currentIndex ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <div className="inline-block mb-4 px-4 py-1 border border-secondary/50 rounded-full bg-black/20 backdrop-blur-sm">
                  <span className="text-secondary font-medium tracking-wider text-sm md:text-base">سبائك الماسة</span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                  {slide.title}
                </h1>

                <p className="text-lg md:text-2xl text-gray-200 mb-10 drop-shadow-md">
                  {slide.subtitle}
                </p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: index === currentIndex ? 1 : 0, scale: index === currentIndex ? 1 : 0.9 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex items-center justify-center gap-4 flex-wrap"
                >
                  <button
                    onClick={() => openModal()}
                    className="inline-flex items-center justify-center h-14 px-8 rounded-md bg-secondary text-white font-bold text-lg hover:bg-white hover:text-primary transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    {slide.ctaText || "اطلب الخدمة"}
                  </button>
                  <a
                    href="/#services"
                    className="inline-flex items-center justify-center h-14 px-8 rounded-md border-2 border-white/50 text-white font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  >
                    تعرف على خدماتنا
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
        {displaySlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-10 bg-secondary" : "w-3 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
