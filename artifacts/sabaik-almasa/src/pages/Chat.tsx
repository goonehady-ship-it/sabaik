import { useState, useEffect, useRef } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCreateConversation, useGetMessages, useSendMessage } from "@workspace/api-client-react"
import { MessageSenderType, MessageInputSenderType } from "@workspace/api-client-react"
import { Send, User, Phone, Bot, ArrowRight } from "lucide-react"
import { Link } from "wouter"

export default function Chat() {
  const [conversationId, setConversationId] = useState<number | null>(
    () => {
      const saved = localStorage.getItem("sabaik_chat_id")
      return saved ? parseInt(saved) : null
    }
  )
  
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { mutate: createConv, isPending: isCreating } = useCreateConversation()
  const { data: messages, refetch } = useGetMessages(conversationId as number, { 
    query: { 
      enabled: !!conversationId, 
      refetchInterval: 5000 // Poll every 5s
    } 
  })
  const { mutate: sendMsg, isPending: isSending } = useSendMessage()

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return

    createConv({ data: { clientName: name, phone } }, {
      onSuccess: (res) => {
        setConversationId(res.id)
        localStorage.setItem("sabaik_chat_id", res.id.toString())
      }
    })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !conversationId) return

    const text = input.trim()
    setInput("")

    sendMsg({ data: { content: text, senderType: MessageInputSenderType.client } }, {
      onSuccess: () => {
        refetch()
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" dir="rtl">
      <header className="bg-primary text-white py-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-secondary transition-colors">
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Sabaik" className="h-8" onError={(e) => e.currentTarget.style.display='none'}/>
            <span className="font-bold text-lg hidden sm:inline">الدعم المباشر</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col">
        {!conversationId ? (
          <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12 max-w-md mx-auto w-full mt-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">تواصل معنا</h1>
              <p className="text-gray-500 text-sm">الرجاء إدخال بياناتك لبدء المحادثة مع فريق الدعم الفني.</p>
            </div>

            <form onSubmit={handleStartChat} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكريم</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-3 pr-10"
                    placeholder="مثال: أحمد محمد"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-3 pr-10 text-right"
                    dir="ltr"
                    placeholder="05XXXXXXXX"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-lg mt-4 bg-secondary hover:bg-secondary/90 text-white"
                disabled={isCreating}
              >
                {isCreating ? "جاري الاتصال..." : "بدء المحادثة"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border flex flex-col h-[70vh]">
            <div className="p-4 border-b bg-gray-50/50 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">فريق الدعم - سبائك الماسة</h2>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> متاح الآن
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  localStorage.removeItem("sabaik_chat_id")
                  setConversationId(null)
                }}
                className="text-gray-500 text-xs hover:text-destructive"
              >
                إنهاء المحادثة
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/pattern.png')] bg-repeat bg-opacity-5">
              <div className="text-center">
                <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">اليوم</span>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-primary text-white max-w-[80%] p-3 rounded-2xl rounded-tr-sm text-sm">
                  مرحباً بك! كيف يمكننا مساعدتك اليوم؟
                </div>
              </div>

              {messages?.map((msg) => {
                const isClient = msg.senderType === MessageSenderType.client
                return (
                  <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      isClient 
                        ? 'bg-secondary text-secondary-foreground rounded-tl-sm' 
                        : 'bg-white border text-gray-800 rounded-tr-sm shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-2xl flex gap-2">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="flex-1 bg-gray-50 focus-visible:ring-secondary"
                autoFocus
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isSending}
                className="bg-primary hover:bg-primary/90 text-white shrink-0 px-8"
              >
                {isSending ? "..." : "إرسال"}
                <Send size={16} className="mr-2 rtl:-scale-x-100" />
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
