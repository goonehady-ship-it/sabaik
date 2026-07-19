import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useGetSlides } from "@workspace/api-client-react"

export function HeroSlider() {
  const { data: slides, isLoading } = useGetSlides()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Default slides fallback
  const displaySlides = slides && slides.length > 0 ? slides : [
    {
      id: 1,
      title: "قوة في الأداء، دقة في التنفيذ",
      subtitle: "رواد تأجير الحاويات ونقل الأنقاض في المملكة",
      imageUrl: "/hero1.jpg",
      ctaText: "اطلب حاويتك الآن",
    },
    {
      id: 2,
      title: "أسطول متكامل لخدمتك",
      subtitle: "حاويات بمقاسات متعددة تناسب كافة مشاريعك",
      imageUrl: "/hero2.jpg",
      ctaText: "تصفح الحاويات",
    },
    {
      id: 3,
      title: "حلول بيئية مستدامة",
      subtitle: "نعمل وفق أعلى معايير الجودة والسلامة البيئية",
      imageUrl: "/hero3.jpg",
      ctaText: "تعرف علينا",
    }
  ]

  useEffect(() => {
    if (displaySlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [displaySlides.length])

  if (isLoading) {
    return <div className="h-[100dvh] w-full bg-primary flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
    </div>
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
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback style if image doesn't load
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1"><rect fill="%230A192F" width="1" height="1"/></svg>'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-black/40"></div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="container mx-auto px-4 md:px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: index === currentIndex ? 1 : 0, y: index === currentIndex ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <div className="inline-block mb-4 px-4 py-1 border border-secondary/50 rounded-full bg-black/20 backdrop-blur-sm">
                  <span className="text-secondary font-medium tracking-wider text-sm md:text-base">
                    سبائك الماسة
                  </span>
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
                >
                  <a
                    href="#request-service"
                    className="inline-flex items-center justify-center h-14 px-8 rounded-md bg-secondary text-white font-bold text-lg hover:bg-white hover:text-primary transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    {slide.ctaText || "اطلب الخدمة"}
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
        {displaySlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-10 bg-secondary" : "w-3 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
