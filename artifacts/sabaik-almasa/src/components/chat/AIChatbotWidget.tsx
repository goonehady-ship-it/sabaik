import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCreateConversation, useGetMessages, useSendMessage, useAiChat } from "@workspace/api-client-react"
import { MessageSenderType, MessageInputSenderType } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, X, Send, Diamond, Bot, User, Phone } from "lucide-react"

export function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([
    { text: "مرحباً بك في سبائك الماسة! كيف يمكنني مساعدتك اليوم؟", isUser: false }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { mutate: sendAiMsg } = useAiChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return

    const userText = input.trim()
    setMessages(prev => [...prev, { text: userText, isUser: true }])
    setInput("")
    setIsTyping(true)

    sendAiMsg({ data: { message: userText, conversationId } }, {
      onSuccess: (res) => {
        setMessages(prev => [...prev, { text: res.reply, isUser: false }])
        if (res.conversationId && !conversationId) {
          setConversationId(res.conversationId)
        }
      },
      onSettled: () => {
        setIsTyping(false)
      }
    })
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 h-[500px] max-h-[calc(100vh-120px)] bg-card border shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center relative">
                  <Bot size={20} className="text-secondary" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">المساعد الذكي</h3>
                  <p className="text-xs text-white/70">متصل الآن</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.isUser 
                      ? 'bg-secondary text-secondary-foreground rounded-br-sm' 
                      : 'bg-white border text-foreground rounded-bl-sm'}`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border p-4 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
                    <motion.div className="w-1.5 h-1.5 bg-primary/40 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary/40 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary/40 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-card border-t shrink-0 flex gap-2">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="rounded-full bg-muted/50 border-transparent focus-visible:ring-secondary"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full shrink-0 bg-primary hover:bg-primary/90 text-white"
                disabled={!input.trim() || isTyping}
              >
                <Send size={18} className="rtl:-scale-x-100" />
              </Button>
            </form>
            
            <div className="bg-muted py-2 text-center border-t">
              <a href="/chat" className="text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
                <Phone size={12} />
                الانتقال للمحادثة المباشرة مع فريق الدعم
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center border-2 border-secondary"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare size={24} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary border-2 border-primary"></span>
          </span>
        )}
      </motion.button>
    </>
  )
}
