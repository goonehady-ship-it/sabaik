import * as React from "react"
import { Link } from "wouter"
import { Phone, Mail, MapPin, Instagram, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <img src="/logo.png" alt="Sabaik Almasa Logo" className="h-16 w-auto mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed">
              شركة سبائك الماسة، خيارك الأمثل في عالم تأجير الحاويات ونقل الأنقاض. نقدم خدماتنا بجودة عالية وأسعار تنافسية لنكون شركاء نجاحك في مشاريعك الإنشائية.
            </p>
            <div className="flex space-x-4 space-x-reverse pt-4">
              <a href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6 text-secondary relative inline-block">
              روابط سريعة
              <span className="absolute bottom-0 right-0 w-1/2 h-1 bg-secondary rounded-full -mb-2"></span>
            </h3>
            <ul className="space-y-3">
              <li><Link href="/"><span className="text-gray-300 hover:text-white transition-colors cursor-pointer block">الرئيسية</span></Link></li>
              <li><a href="/#about" className="text-gray-300 hover:text-white transition-colors block">من نحن</a></li>
              <li><a href="/#services" className="text-gray-300 hover:text-white transition-colors block">خدماتنا</a></li>
              <li><a href="/#containers" className="text-gray-300 hover:text-white transition-colors block">حاوياتنا</a></li>
              <li><a href="/chat" className="text-gray-300 hover:text-white transition-colors block">الدعم المباشر</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6 text-secondary relative inline-block">
              الخدمات
              <span className="absolute bottom-0 right-0 w-1/2 h-1 bg-secondary rounded-full -mb-2"></span>
            </h3>
            <ul className="space-y-3">
              <li className="text-gray-300">تأجير الحاويات</li>
              <li className="text-gray-300">نقل الأنقاض</li>
              <li className="text-gray-300">خدمات المصانع</li>
              <li className="text-gray-300">الحلول البيئية</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6 text-secondary relative inline-block">
              معلومات التواصل
              <span className="absolute bottom-0 right-0 w-1/2 h-1 bg-secondary rounded-full -mb-2"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-secondary shrink-0 mt-1" size={20} />
                <span className="text-gray-300">المملكة العربية السعودية، الرياض</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-secondary shrink-0" size={20} />
                <div className="flex flex-col">
                  <a href="tel:0555888767" className="text-gray-300 hover:text-white transition-colors" dir="ltr">0555 888 767</a>
                  <a href="tel:0580595555" className="text-gray-300 hover:text-white transition-colors" dir="ltr">0580 595 555</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-secondary shrink-0" size={20} />
                <a href="mailto:info@sabaik.net" className="text-gray-300 hover:text-white transition-colors">info@sabaik.net</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            جميع الحقوق محفوظة © {new Date().getFullYear()} لشركة سبائك الماسة
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <a href="#" className="hover:text-white">الشروط والأحكام</a>
            <a href="#" className="hover:text-white">سياسة الخصوصية</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
