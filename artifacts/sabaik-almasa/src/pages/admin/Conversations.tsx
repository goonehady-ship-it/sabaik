import { useState, useRef, useEffect } from "react"
import { useGetConversations, useGetMessages, useSendMessage, useUpdateConversation } from "@workspace/api-client-react"
import { MessageSenderType, MessageInputSenderType, ConversationStatus, ConversationUpdateStatus } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User, CheckCircle2, Clock, MessageSquare } from "lucide-react"

export default function AdminConversations() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [reply, setReply] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversations, refetch: refetchConvs } = useGetConversations()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: messages, refetch: refetchMsgs } = useGetMessages(selectedId as number, {
    query: { enabled: !!selectedId, refetchInterval: 3000 } as any,
  })

  const { mutate: sendMsg } = useSendMessage()
  const { mutate: updateConv } = useUpdateConversation()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView()
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim() || !selectedId) return

    sendMsg({ id: selectedId!, data: { content: reply, senderType: MessageInputSenderType.admin } }, {
      onSuccess: () => {
        setReply("")
        refetchMsgs()
        refetchConvs()
      }
    })
  }

  const handleClose = () => {
    if (!selectedId) return
    updateConv({ id: selectedId, data: { status: ConversationUpdateStatus.closed } }, {
      onSuccess: () => {
        refetchConvs()
        setSelectedId(null)
      }
    })
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      
      {/* List */}
      <Card className="w-1/3 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50 font-bold text-lg text-primary">المحادثات النشطة</div>
        <div className="flex-1 overflow-y-auto">
          {conversations?.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`w-full text-right p-4 border-b transition-colors ${
                selectedId === conv.id ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-gray-900">{conv.clientName}</span>
                {conv.status === 'open' && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
              </div>
              <div className="text-xs text-gray-500 dir-ltr text-right mb-2">{conv.phone}</div>
              <p className="text-sm text-gray-600 truncate">{conv.lastMessage || 'محادثة جديدة'}</p>
            </button>
          ))}
          {(!conversations || conversations.length === 0) && (
            <div className="p-8 text-center text-gray-500">لا توجد محادثات</div>
          )}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="w-2/3 flex flex-col overflow-hidden bg-gray-50/50">
        {selectedId ? (
          <>
            <div className="p-4 border-b bg-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold">المحادثة #{selectedId}</h3>
                  <p className="text-xs text-green-600">متصل الآن</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleClose} className="text-gray-600">
                <CheckCircle2 size={16} className="mr-2" /> إغلاق المحادثة
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages?.map(msg => {
                const isAdmin = msg.senderType === MessageSenderType.admin || msg.senderType === MessageSenderType.ai
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                      isAdmin 
                        ? 'bg-primary text-white rounded-tr-sm' 
                        : 'bg-white border shadow-sm text-gray-800 rounded-tl-sm'
                    }`}>
                      {msg.content}
                      {msg.senderType === MessageSenderType.ai && (
                        <div className="text-[10px] text-white/50 mt-1 flex items-center gap-1">
                          <Clock size={10} /> رد آلي
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
              <Input 
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="اكتب ردك هنا..."
                className="flex-1 bg-gray-50 focus-visible:ring-primary"
              />
              <Button type="submit" className="bg-primary text-white shrink-0 px-6">
                إرسال <Send size={16} className="mr-2 rtl:-scale-x-100" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p>اختر محادثة لعرض التفاصيل</p>
            </div>
          </div>
        )}
      </Card>

    </div>
  )
}
