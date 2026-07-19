import * as React from "react"
import { Link } from "wouter"
import { useServiceRequest } from "@/context/ServiceRequestContext"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { openModal } = useServiceRequest()

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-primary/95 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Sabaik Almasa Logo" className="h-10 md:h-12 w-auto" />
            <span className={`font-bold text-xl md:text-2xl hidden md:block ${isScrolled ? "text-white" : "text-white drop-shadow-md"}`}>
              سبائك الماسة
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <NavLink href="/" text="الرئيسية" isScrolled={isScrolled} />
            <NavLink href="/#services" text="خدماتنا" isScrolled={isScrolled} />
            <NavLink href="/#containers" text="حاوياتنا" isScrolled={isScrolled} />
            <NavLink href="/#values" text="قيمنا" isScrolled={isScrolled} />
            <NavLink href="/#testimonials" text="شهادات" isScrolled={isScrolled} />
            <NavLink href="/#contact" text="تواصل" isScrolled={isScrolled} />
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => openModal()}
              className="hidden sm:inline-flex items-center bg-secondary text-white px-6 py-2 rounded-md font-bold text-sm hover:bg-white hover:text-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              اطلب الخدمة
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, text, isScrolled }: { href: string; text: string; isScrolled: boolean }) {
  return (
    <a
      href={href}
      className={`font-medium transition-colors hover:text-secondary ${
        isScrolled ? "text-gray-200" : "text-gray-100 drop-shadow-md"
      }`}
    >
      {text}
    </a>
  )
}
