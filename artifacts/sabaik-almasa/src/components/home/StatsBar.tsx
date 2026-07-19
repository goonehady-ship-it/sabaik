import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"

export function StatsBar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" })
  
  const stats = [
    { label: "سنوات خبرة", value: 6, suffix: "+" },
    { label: "مشروع منجز", value: 500, suffix: "+" },
    { label: "خدمة مستمرة", value: 24, suffix: "/7" },
    { label: "رضا العملاء", value: 100, suffix: "%" },
  ]

  return (
    <section className="bg-white py-16 border-b" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center text-4xl md:text-5xl font-extrabold text-primary mb-2">
                <Counter from={0} to={stat.value} trigger={isInView} />
                <span className="text-secondary ml-1">{stat.suffix}</span>
              </div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Counter({ from, to, trigger }: { from: number, to: number, trigger: boolean }) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    if (!trigger) return
    
    let startTimestamp: number | null = null
    const duration = 2000 // 2 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      
      // ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      setCount(Math.floor(easeProgress * (to - from) + from))
      
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    
    window.requestAnimationFrame(step)
  }, [trigger, from, to])

  return <span>{count}</span>
}
