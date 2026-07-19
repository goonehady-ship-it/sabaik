import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const SYSTEM_PROMPT = `أنت مساعد ذكي لشركة "سبائك الماسة" المتخصصة في تأجير الحاويات ونقل الأنقاض في الرياض، المملكة العربية السعودية.
معلومات الشركة:
- الاسم: مؤسسة سبائك الماسة لتأجير الحاويات ونقل الأنقاض
- التأسيس: 2018 في الرياض
- السجل التجاري: 7010655533
- الهاتف: 0555888767 / 0580595555
- البريد: info@sabaik.net
- الخدمات: تأجير حاويات (12 ياردة، 20 ياردة)، نقل الأنقاض، خدمات المصانع، الحلول البيئية

أجب دائماً باللغة العربية. كن ودياً ومحترفاً. اقترح طلب الخدمة عند الاستفسار.
إذا سأل العميل عن الأسعار، أخبره بالتواصل معنا مباشرة للحصول على أفضل عرض.`;

async function getAIReply(message: string): Promise<string> {
  // Simple rule-based AI for common questions
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("سعر") || lowerMsg.includes("تكلفة") || lowerMsg.includes("كم")) {
    return "للحصول على أفضل سعر مناسب لاحتياجاتك، يرجى التواصل معنا مباشرة على 0555888767 أو 0580595555. سيسعد فريقنا بتقديم عرض مخصص لمشروعك.";
  }
  if (lowerMsg.includes("حاوية") || lowerMsg.includes("container")) {
    return "نوفر حاويات بأحجام مختلفة:\n• حاوية 12 ياردة - مثالية للأعمال الصغيرة والترميم\n• حاوية 20 ياردة - للمشاريع الكبيرة والإنشاءات\n\nهل تريد الاستفسار عن حاوية معينة؟";
  }
  if (lowerMsg.includes("نقل") || lowerMsg.includes("أنقاض") || lowerMsg.includes("ردم")) {
    return "نقدم خدمات نقل الأنقاض والردم الاحترافية إلى المواقع المعتمدة. نضمن السرعة والالتزام بالمواعيد. هل تريد طلب الخدمة الآن؟";
  }
  if (lowerMsg.includes("وقت") || lowerMsg.includes("متى") || lowerMsg.includes("توصيل")) {
    return "نعمل على مدار أيام الأسبوع ونضمن سرعة الاستجابة والتوصيل داخل مدينة الرياض. يمكننا التوصيل في نفس اليوم أو اليوم التالي حسب الطلب.";
  }
  if (lowerMsg.includes("مصنع") || lowerMsg.includes("ورشة")) {
    return "نقدم حلولاً متكاملة للمصانع والورش بأحجام حاويات متنوعة تناسب جميع الاحتياجات. تواصل معنا لمعرفة العروض الخاصة للعملاء التجاريين.";
  }
  if (lowerMsg.includes("مرحبا") || lowerMsg.includes("هلا") || lowerMsg.includes("السلام")) {
    return "أهلاً وسهلاً! مرحباً بك في سبائك الماسة. أنا هنا لمساعدتك. كيف يمكنني خدمتك اليوم؟";
  }
  if (lowerMsg.includes("شكر") || lowerMsg.includes("شكرا")) {
    return "شكراً لتواصلك مع سبائك الماسة. يسعدنا خدمتك دائماً! 🙏";
  }

  return `شكراً على تواصلك مع سبائك الماسة. نحن متخصصون في:\n• تأجير الحاويات (12 و 20 ياردة)\n• نقل الأنقاض والردم\n• خدمات المصانع والورش\n• الحلول البيئية\n\nللاستفسار والطلب، تواصل معنا على:\n📞 0555888767 / 0580595555\n✉️ info@sabaik.net\n\nأو يمكنك طلب الخدمة مباشرة من موقعنا!`;
}

router.post("/ai/chat", async (req, res) => {
  const { message, conversationId } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  let convId = conversationId;

  // Save user message if conversation exists
  if (convId) {
    await db.insert(messagesTable).values({
      conversationId: convId,
      content: message,
      senderType: "client",
    });
  }

  const reply = await getAIReply(message);

  // Save AI reply if conversation exists
  if (convId) {
    await db.insert(messagesTable).values({
      conversationId: convId,
      content: reply,
      senderType: "ai",
    });
    await db.update(conversationsTable)
      .set({ lastMessage: reply, updatedAt: sql`now()` })
      .where(eq(conversationsTable.id, convId));
  }

  return res.json({ reply, conversationId: convId ?? null });
});

export default router;
