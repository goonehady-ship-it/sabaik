import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Bot, ChevronRight, CheckCircle, MapPin, Phone, User, Package, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlowState {
  step: string
  data: {
    serviceType?: string
    containerSize?: string
    containerPrice?: number
    location?: string
    name?: string
    phone?: string
  }
}

type MessageType = "text" | "options" | "service_cards" | "container_cards" | "order_confirm" | "success"

interface OptionItem { label: string; value: string; emoji?: string }
interface ServiceCard { id: string; title: string; description: string; image: string; emoji: string }
interface ContainerCard {
  id: string; name: string; size: string; capacity: string
  price: number; priceNote: string; image: string; features: string[]; bestFor: string
}

interface BotMessage {
  id: string
  isUser: boolean
  text: string
  type: MessageType
  options?: OptionItem[]
  cards?: ServiceCard[] | ContainerCard[]
  orderData?: Record<string, unknown>
  timestamp: Date
}

// ─── API ──────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

async function sendToBot(message: string, flowState: FlowState, conversationId: number | null) {
  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, flowState, conversationId }),
  })
  return res.json()
}

async function getWelcome() {
  const res = await fetch(`${API_BASE}/api/ai/chat/welcome`)
  return res.json()
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary/50 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.7, delay }}
          />
        ))}
      </div>
    </div>
  )
}

function ServiceCardGrid({ cards, onSelect }: { cards: ServiceCard[]; onSelect: (value: string, label: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-1">
      {cards.map((card) => (
        <motion.button
          key={card.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(card.id, card.title)}
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm text-right hover:border-primary/40 hover:shadow-md transition-all"
        >
          <div className="h-24 overflow-hidden">
            <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          <div className="absolute bottom-0 inset-x-0 p-2.5">
            <p className="text-white font-bold text-xs leading-tight">{card.emoji} {card.title}</p>
            <p className="text-white/80 text-[10px] leading-tight mt-0.5 line-clamp-2">{card.description}</p>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

function ContainerCardList({ cards, onSelect }: { cards: ContainerCard[]; onSelect: (value: string, label: string) => void }) {
  return (
    <div className="space-y-2 mt-1">
      {cards.map((card) => (
        <motion.button
          key={card.id}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(card.id, `${card.name} - ${card.size}`)}
          className="w-full flex gap-3 rounded-xl border border-gray-100 bg-white shadow-sm text-right hover:border-primary/50 hover:shadow-md transition-all p-0 overflow-hidden"
        >
          <div className="w-24 h-24 shrink-0 overflow-hidden">
            <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 py-2.5 pl-3 pr-1 text-right">
            <div className="flex items-start justify-between gap-1">
              <div>
                <p className="font-bold text-sm text-gray-900">{card.name}</p>
                <p className="text-xs text-gray-500">{card.size} — {card.capacity}</p>
              </div>
              <div className="text-left shrink-0">
                <span className="text-primary font-bold text-sm">{card.price}</span>
                <span className="text-[10px] text-gray-400 block -mt-0.5">ريال/{card.priceNote}</span>
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {card.features.slice(0, 2).map((f) => (
                <span key={f} className="text-[9px] bg-primary/8 text-primary px-1.5 py-0.5 rounded-full border border-primary/15">{f}</span>
              ))}
            </div>
            <p className="text-[10px] text-secondary font-semibold mt-1">✓ الأنسب: {card.bestFor}</p>
          </div>
          <div className="flex items-center pl-2 pr-1">
            <ChevronRight size={14} className="text-gray-300" />
          </div>
        </motion.button>
      ))}
    </div>
  )
}

function OptionsGrid({ options, onSelect }: { options: OptionItem[]; onSelect: (value: string, label: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((opt) => (
        <motion.button
          key={opt.value}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(opt.value, opt.label)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-white hover:bg-primary hover:text-white hover:border-primary text-primary text-xs font-medium transition-all shadow-sm"
        >
          {opt.emoji && <span>{opt.emoji}</span>}
          {opt.label}
        </motion.button>
      ))}
    </div>
  )
}

function OrderConfirmCard({ data, onConfirm, onEdit }: {
  data: Record<string, unknown>
  onConfirm: () => void
  onEdit: () => void
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-1">
      <div className="bg-primary/5 border-b border-primary/10 px-4 py-2.5">
        <p className="text-primary font-bold text-sm flex items-center gap-2">
          <Package size={15} /> ملخص طلبك
        </p>
      </div>
      <div className="p-4 space-y-2.5">
        <Row icon={<Package size={13} />} label="الخدمة" value={data.serviceType as string} />
        {data.containerSize && <Row icon={<Package size={13} />} label="الحاوية" value={data.containerSize as string} />}
        {data.containerPrice && (
          <Row icon={<span className="text-[11px] font-bold">﷼</span>} label="السعر" value={`${data.containerPrice} ريال/يوم`} />
        )}
        <Row icon={<MapPin size={13} />} label="الموقع" value={data.location as string} />
        <Row icon={<User size={13} />} label="الاسم" value={data.name as string} />
        <Row icon={<Phone size={13} />} label="الجوال" value={data.phone as string} />
      </div>
      <div className="p-3 border-t border-gray-100 flex gap-2">
        <Button
          onClick={onConfirm}
          className="flex-1 h-9 text-sm bg-primary hover:bg-primary/90 text-white rounded-xl"
        >
          <CheckCircle size={14} className="ml-1.5" />
          تأكيد الطلب
        </Button>
        <Button
          onClick={onEdit}
          variant="outline"
          className="flex-1 h-9 text-sm rounded-xl border-gray-200 text-gray-600"
        >
          تعديل
        </Button>
      </div>
    </div>
  )
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-primary mt-0.5 shrink-0">{icon}</span>
      <span className="text-gray-500 shrink-0 w-14">{label}:</span>
      <span className="text-gray-800 font-medium text-xs flex-1">{value}</span>
    </div>
  )
}

function SuccessCard({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 text-center mt-1">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"
      >
        <CheckCircle size={28} className="text-white" />
      </motion.div>
      <h3 className="font-bold text-gray-900 text-base mb-1">تم إرسال طلبك! 🎉</h3>
      <div className="bg-white rounded-xl px-4 py-2 mb-3 inline-block shadow-sm border border-green-100">
        <p className="text-xs text-gray-500">رقم الطلب</p>
        <p className="text-2xl font-black text-primary">#{data.orderId as number}</p>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed mb-3">
        سيتواصل معك فريقنا خلال ساعات قليلة على
        <span className="font-bold text-primary mx-1 dir-ltr">{data.phone as string}</span>
      </p>
      <div className="flex gap-2 text-xs text-gray-500 justify-center">
        <span>📞 0555888767</span>
        <span>•</span>
        <span>📞 0580595555</span>
      </div>
    </div>
  )
}

// ─── Message Renderer ─────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  onOptionSelect,
  onConfirmOrder,
  onEditOrder,
}: {
  msg: BotMessage
  onOptionSelect: (value: string, label: string) => void
  onConfirmOrder: () => void
  onEditOrder: () => void
}) {
  if (msg.isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-secondary text-white text-sm shadow-sm leading-relaxed">
          {msg.text}
        </div>
      </div>
    )
  }

  // Parse bold markdown **text**
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    )
  }

  return (
    <div className="flex justify-start max-w-[92%]">
      <div className="flex-1">
        {msg.type !== "order_confirm" && msg.type !== "success" && (
          <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {renderText(msg.text)}
          </div>
        )}

        {msg.type === "options" && msg.options && (
          <OptionsGrid options={msg.options} onSelect={onOptionSelect} />
        )}

        {msg.type === "service_cards" && msg.cards && (
          <ServiceCardGrid cards={msg.cards as ServiceCard[]} onSelect={onOptionSelect} />
        )}

        {msg.type === "container_cards" && (
          <>
            <ContainerCardList
              cards={msg.cards as ContainerCard[]}
              onSelect={onOptionSelect}
            />
            {msg.options && <OptionsGrid options={msg.options} onSelect={onOptionSelect} />}
          </>
        )}

        {msg.type === "order_confirm" && msg.orderData && (
          <OrderConfirmCard data={msg.orderData} onConfirm={onConfirmOrder} onEdit={onEditOrder} />
        )}

        {msg.type === "success" && msg.orderData && (
          <SuccessCard data={msg.orderData} />
        )}
      </div>
    </div>
  )
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [messages, setMessages] = useState<BotMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [flowState, setFlowState] = useState<FlowState>({ step: "welcome", data: {} })
  const [conversationId] = useState<number | null>(null)
  const [unread, setUnread] = useState(1)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }, [])

  // Load welcome on first open
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true)
      setUnread(0)
      setIsTyping(true)
      getWelcome().then((resp) => {
        setIsTyping(false)
        addBotMessage(resp)
        setFlowState(resp.flowState)
      }).catch(() => setIsTyping(false))
    }
    if (isOpen) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, hasOpened])

  useEffect(() => { scrollToBottom() }, [messages, isTyping])

  function addBotMessage(resp: Record<string, unknown>) {
    const msg: BotMessage = {
      id: crypto.randomUUID(),
      isUser: false,
      text: resp.reply as string,
      type: (resp.messageType as MessageType) || "text",
      options: resp.options as OptionItem[] | undefined,
      cards: resp.cards as ServiceCard[] | ContainerCard[] | undefined,
      orderData: resp.orderData as Record<string, unknown> | undefined,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, msg])
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return

    // Add user message
    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(),
      isUser: true,
      text,
      type: "text",
      timestamp: new Date(),
    }])
    setInput("")
    setIsTyping(true)

    try {
      const resp = await sendToBot(text, flowState, conversationId)
      setIsTyping(false)
      addBotMessage(resp)
      if (resp.flowState) setFlowState(resp.flowState)
    } catch {
      setIsTyping(false)
      addBotMessage({
        reply: "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.",
        messageType: "options",
        options: [{ label: "رجوع للقائمة", value: "menu", emoji: "🏠" }],
        flowState,
      })
    }
  }

  async function handleOptionSelect(value: string, label: string) {
    // Special shortcuts
    if (value === "menu" || value === "القائمة الرئيسية") {
      await sendMessage("القائمة الرئيسية")
      return
    }
    if (value === "done") {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        isUser: false,
        text: "شكراً لتواصلك مع سبائك الماسة! 😊",
        type: "text",
        timestamp: new Date(),
      }])
      return
    }
    await sendMessage(label)
  }

  async function handleConfirmOrder() {
    await sendMessage("تأكيد")
  }

  async function handleEditOrder() {
    await sendMessage("تعديل")
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 left-4 sm:left-6 z-50 w-[340px] sm:w-[400px] max-w-[calc(100vw-2rem)] bg-gray-50 border border-gray-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "calc(100vh - 130px)", minHeight: 480 }}
          >
            {/* Header */}
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
                    <Bot size={20} className="text-secondary" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-primary rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1.5">
                    المساعد الذكي
                    <span className="text-[9px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full border border-secondary/30 font-normal">AI</span>
                  </h3>
                  <p className="text-[11px] text-white/70 flex items-center gap-1">
                    <Sparkles size={10} />
                    سبائك الماسة — متصل الآن
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
              {messages.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3 py-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot size={28} className="text-primary/60" />
                  </div>
                  <p className="text-sm">جاري تحميل المساعد الذكي...</p>
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onOptionSelect={handleOptionSelect}
                  onConfirmOrder={handleConfirmOrder}
                  onEditOrder={handleEditOrder}
                />
              ))}

              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-gray-200 bg-white">
              <form onSubmit={handleSubmit} className="flex gap-2 p-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 rounded-full text-sm bg-gray-50 border-gray-200 focus-visible:ring-primary/50 h-9"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  className="rounded-full shrink-0 h-9 w-9 bg-primary hover:bg-primary/90 text-white"
                >
                  <Send size={15} className="rtl:-scale-x-100" />
                </Button>
              </form>
              <div className="pb-2 text-center">
                <p className="text-[10px] text-gray-400">مدعوم بالذكاء الاصطناعي · سبائك الماسة</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 left-4 sm:left-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-xl shadow-primary/25 flex items-center justify-center border-2 border-secondary"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <MessageSquare size={22} />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-secondary text-white text-[10px] font-bold items-center justify-center border-2 border-primary">
              {unread}
            </span>
          </span>
        )}
      </motion.button>
    </>
  )
}
