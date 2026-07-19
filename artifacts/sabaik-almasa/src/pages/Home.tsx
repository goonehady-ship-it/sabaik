import { Home as HomeIcon } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { HeroSlider } from "@/components/home/HeroSlider"
import { StatsBar } from "@/components/home/StatsBar"
import { AboutSection } from "@/components/home/AboutSection"
import { ServicesSection } from "@/components/home/ServicesSection"
import { ContainersSection } from "@/components/home/ContainersSection"
import { ValuesSection } from "@/components/home/ValuesSection"
import { WhyChooseUs } from "@/components/home/WhyChooseUs"
import { Testimonials } from "@/components/home/Testimonials"
import { Partners } from "@/components/home/Partners"
import { CEOMessage } from "@/components/home/CEOMessage"
import { ServiceRequestForm } from "@/components/home/ServiceRequestForm"
import { AIChatbotWidget } from "@/components/chat/AIChatbotWidget"

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans" dir="rtl">
      <Navbar />
      
      <main>
        <HeroSlider />
        <StatsBar />
        <AboutSection />
        <ServicesSection />
        <ContainersSection />
        <ValuesSection />
        <WhyChooseUs />
        <Testimonials />
        <Partners />
        <CEOMessage />
        <ServiceRequestForm />
        
        {/* Contact Strip before Footer */}
        <section id="contact" className="py-12 bg-white border-t">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-primary/5 p-8 rounded-2xl border border-primary/10">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-2">هل لديك استفسار؟</h3>
                <p className="text-gray-600">فريقنا مستعد للإجابة على جميع استفساراتك على مدار الساعة.</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <a href="https://wa.me/966555888767" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-md">
                  تواصل عبر واتساب
                </a>
                <a href="tel:0580595555" className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-primary px-6 py-3 rounded-lg font-bold transition-colors shadow-sm">
                  اتصال هاتفي
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <AIChatbotWidget />
      
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/966555888767" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-24 left-6 z-40 bg-green-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
      </a>
    </div>
  )
}
