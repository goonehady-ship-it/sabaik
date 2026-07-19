import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable, serviceRequestsTable, notificationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// ─── Types ─────────────────────────────────────────────────────────────────

interface FlowData {
  serviceType?: string;
  containerSize?: string;
  containerPrice?: number;
  location?: string;
  name?: string;
  phone?: string;
}

interface FlowState {
  step: string;
  data: FlowData;
}

type MessageType =
  | "text"
  | "options"
  | "service_cards"
  | "container_cards"
  | "order_confirm"
  | "success";

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  image: string;
  emoji: string;
}

interface ContainerCard {
  id: string;
  name: string;
  size: string;
  capacity: string;
  price: number;
  priceNote: string;
  image: string;
  features: string[];
  bestFor: string;
}

interface OptionItem {
  label: string;
  value: string;
  emoji?: string;
}

interface BotResponse {
  reply: string;
  messageType: MessageType;
  options?: OptionItem[];
  cards?: ServiceCard[] | ContainerCard[];
  orderData?: Record<string, unknown>;
  flowState: FlowState;
  conversationId?: number | null;
}

// ─── Static Data ────────────────────────────────────────────────────────────

const SERVICES: ServiceCard[] = [
  {
    id: "container_rental",
    title: "تأجير حاويات",
    description: "حاويات بأحجام مختلفة للبناء والترميم والهدم",
    image: "/container1.jpg",
    emoji: "📦",
  },
  {
    id: "debris_transport",
    title: "نقل الأنقاض والردم",
    description: "نقل احترافي إلى مواقع الردم المعتمدة بالرياض",
    image: "/container2.jpg",
    emoji: "🚛",
  },
  {
    id: "factory",
    title: "خدمات المصانع والورش",
    description: "حلول متكاملة ومتخصصة للمنشآت الصناعية",
    image: "/container3.jpg",
    emoji: "🏭",
  },
  {
    id: "environmental",
    title: "الحلول البيئية",
    description: "خدمات صديقة للبيئة تدعم رؤية المملكة 2030",
    image: "/container4.jpg",
    emoji: "🌿",
  },
];

const CONTAINERS: ContainerCard[] = [
  {
    id: "small_12",
    name: "حاوية صغيرة",
    size: "12 ياردة",
    capacity: "12 م³",
    price: 150,
    priceNote: "يومياً",
    image: "/container1.jpg",
    features: ["مناسبة للمنازل", "أعمال الترميم البسيط", "المساحات الضيقة"],
    bestFor: "الترميم والمنازل",
  },
  {
    id: "medium_20",
    name: "حاوية متوسطة",
    size: "20 ياردة",
    capacity: "20 م³",
    price: 200,
    priceNote: "يومياً",
    image: "/container2.jpg",
    features: ["المشاريع التجارية", "أعمال الهدم المتوسطة", "توصيل سريع"],
    bestFor: "المشاريع التجارية",
  },
  {
    id: "factory_30",
    name: "حاوية مصانع",
    size: "30 ياردة",
    capacity: "30 م³",
    price: 280,
    priceNote: "يومياً",
    image: "/container3.jpg",
    features: ["المصانع والورش", "تحمل أوزان ثقيلة", "المخلفات الصناعية"],
    bestFor: "المصانع والورش",
  },
  {
    id: "large_40",
    name: "حاوية كبيرة",
    size: "40 ياردة",
    capacity: "40 م³",
    price: 350,
    priceNote: "يومياً",
    image: "/container4.jpg",
    features: ["المشاريع الكبرى", "أقصى سعة تخزينية", "المجمعات السكنية"],
    bestFor: "المشاريع الكبرى",
  },
];

// ─── Saudi Dialect Normalization ─────────────────────────────────────────────

function normalizeSaudi(text: string): string {
  return text
    .replace(/\b(ابغى|ابي|أبغى|أبي|ودي|اريد)\b/g, "أريد")
    .replace(/\bوين\b/g, "أين")
    .replace(/\b(وش|ايش|إيش|شو)\b/g, "ماذا")
    .replace(/\b(هلا|هلو|هاي|مرحبا)\b/g, "مرحباً")
    .replace(/\b(مشكور|يعطيك العافية|يسلمك|مشكورين)\b/g, "شكراً")
    .replace(/\b(زين|تمام|ماشي|اوكي|اوك|اوكيه|صح|آخدها|خذها)\b/g, "نعم")
    .replace(/\b(امتى|وقتاش)\b/g, "متى")
    .replace(/\b(بكم|يكم|بكام)\b/g, "بكم")
    .replace(/\b(غالي|يقطع|يغلى)\b/g, "سعر مرتفع")
    .replace(/\b(رخيص|زهيد|مناسب|كويس)\b/g, "سعر مناسب");
}

// ─── Intent Detection ────────────────────────────────────────────────────────

function detectIntent(raw: string): string {
  const t = normalizeSaudi(raw).toLowerCase();

  if (/طلب|اطلب|أطلب|أريد|احتاج|محتاج|جهز|ابغى/.test(t)) return "order";
  if (/سعر|أسعار|تكلفة|بكم|كلفة|فلوس|مبلغ|كم الحاوية|كم تكلف/.test(t)) return "prices";
  if (/خدمات|خدمه|الخدمات|وش عندكم|إيش عندكم/.test(t)) return "services";
  if (/من انتم|عن الشركة|عن الشركه|معلومات|عنكم/.test(t)) return "about";
  if (/تواصل|اتصل|رقم|هاتف|جوال|كلمني/.test(t)) return "contact";
  if (/مرحب|السلام|صباح|مساء|كيف حالك|كيفك/.test(t)) return "greeting";
  if (/شكر|مشكور|يعطيك/.test(t)) return "thanks";
  if (/نعم|موافق|تأكيد|تأكد|ارسل|يلا|حلو|صح|ماشي|اوكي|اكيد|تمام|زين/.test(t)) return "confirm";
  if (/لا |رجوع|رجع|تعديل|تغيير|غير|مش|بدل/.test(t)) return "cancel";

  return "unknown";
}

function detectService(text: string): string | null {
  const t = text.toLowerCase();
  if (/حاوي|ايجار|تأجير|container/.test(t)) return "container_rental";
  if (/نقل|انقاض|أنقاض|ردم|مخلفات/.test(t)) return "debris_transport";
  if (/مصنع|ورش|ورشة|صناعي/.test(t)) return "factory";
  if (/بيئ|صديق للبيئة/.test(t)) return "environmental";
  return null;
}

function detectContainer(text: string): string | null {
  const t = text.toLowerCase();
  if (/12|صغير|صغيره|ترميم|منزل|بيت|سكن/.test(t)) return "small_12";
  if (/20|متوسط|متوسطه|تجاري/.test(t)) return "medium_20";
  if (/30|مصنع|ورش|صناعي/.test(t)) return "factory_30";
  if (/40|كبير|كبيره|ضخم|ضخمة/.test(t)) return "large_40";
  return null;
}

// ─── Flow Handlers ───────────────────────────────────────────────────────────

function getWelcomeMessage(): BotResponse {
  return {
    reply:
      "أهلاً وسهلاً! 👋 أنا المساعد الذكي لـ **سبائك الماسة** — متخصصون في تأجير الحاويات ونقل الأنقاض بالرياض منذ 2018.\n\nكيف أقدر أساعدك اليوم؟",
    messageType: "options",
    options: [
      { label: "اطلب خدمة الآن", value: "order", emoji: "📦" },
      { label: "عرض الأسعار", value: "prices", emoji: "💰" },
      { label: "خدماتنا", value: "services", emoji: "🛠️" },
      { label: "من نحن", value: "about", emoji: "ℹ️" },
      { label: "تواصل معنا", value: "contact", emoji: "📞" },
    ],
    flowState: { step: "main_menu", data: {} },
  };
}

function handleMainMenu(message: string, intent: string, state: FlowState): BotResponse {
  const service = detectService(message);
  if (service) return goToServiceFlow(service, state.data);

  if (intent === "order") {
    return {
      reply: "ممتاز! 💪 اختر الخدمة اللي تحتاجها:",
      messageType: "service_cards",
      cards: SERVICES,
      flowState: { step: "service_type", data: {} },
    };
  }

  if (intent === "prices") {
    return {
      reply: "💰 أسعارنا الشفافة والتنافسية — كل حاوية بمواصفاتها:",
      messageType: "container_cards",
      cards: CONTAINERS,
      flowState: { step: "main_menu", data: {} },
      options: [
        { label: "اطلب الآن", value: "order", emoji: "📦" },
        { label: "رجوع للقائمة", value: "menu", emoji: "🏠" },
      ],
    };
  }

  if (intent === "services") {
    return {
      reply: "🛠️ خدماتنا المتكاملة في الرياض:",
      messageType: "service_cards",
      cards: SERVICES,
      flowState: { step: "service_type", data: {} },
    };
  }

  if (intent === "about") {
    return {
      reply:
        "🏢 **مؤسسة سبائك الماسة لتأجير الحاويات**\n\n📅 التأسيس: 2018 — الرياض\n📋 السجل التجاري: 7010655533\n⭐ خبرة +6 سنوات\n✅ +500 مشروع منجز\n\nمتخصصون في تأجير حاويات المخلفات ونقل الأنقاض للمشاريع السكنية والتجارية والصناعية في مدينة الرياض.",
      messageType: "options",
      options: [
        { label: "اطلب خدمة", value: "order", emoji: "📦" },
        { label: "شوف الأسعار", value: "prices", emoji: "💰" },
        { label: "تواصل معنا", value: "contact", emoji: "📞" },
      ],
      flowState: { step: "main_menu", data: {} },
    };
  }

  if (intent === "contact") {
    return {
      reply:
        "📞 **بياناتنا للتواصل:**\n\n☎️ 0555888767\n☎️ 0580595555\n✉️ info@sabaik.net\n📍 الرياض، المملكة العربية السعودية\n\nأو اطلب خدمتك الآن من هنا! ⬇️",
      messageType: "options",
      options: [
        { label: "اطلب خدمة الآن", value: "order", emoji: "📦" },
        { label: "رجوع للقائمة", value: "menu", emoji: "🏠" },
      ],
      flowState: { step: "main_menu", data: {} },
    };
  }

  if (intent === "thanks") {
    return {
      reply: "العفو! يسعدنا خدمتك دائماً 😊 في شي آخر أقدر أساعدك فيه؟",
      messageType: "options",
      options: [
        { label: "اطلب خدمة", value: "order", emoji: "📦" },
        { label: "لا، شكراً", value: "done", emoji: "✅" },
      ],
      flowState: { step: "main_menu", data: {} },
    };
  }

  return getWelcomeMessage();
}

function handleServiceType(message: string, state: FlowState): BotResponse {
  const service = detectService(message);
  const t = message.toLowerCase();

  if (/قائمة|رئيسية|رجوع|رجع/.test(t)) return getWelcomeMessage();
  if (service) return goToServiceFlow(service, state.data);

  return {
    reply: "اختر الخدمة اللي تحتاجها 👇",
    messageType: "service_cards",
    cards: SERVICES,
    flowState: { step: "service_type", data: state.data },
  };
}

function goToServiceFlow(serviceId: string, existingData: FlowData): BotResponse {
  if (serviceId === "container_rental") {
    return {
      reply: "ممتاز! 📦 اختر حجم الحاوية المناسب لمشروعك:",
      messageType: "container_cards",
      cards: CONTAINERS,
      flowState: { step: "container_select", data: { ...existingData, serviceType: "تأجير حاويات" } },
    };
  }

  const names: Record<string, string> = {
    debris_transport: "نقل الأنقاض والردم",
    factory: "خدمات المصانع والورش",
    environmental: "الحلول البيئية",
  };

  return {
    reply: `ممتاز! اخترت **${names[serviceId]}** 👍\n\nوين الموقع اللي تحتاج الخدمة فيه؟\nأرسل العنوان أو رابط الموقع من قوقل ماب 📍`,
    messageType: "text",
    flowState: {
      step: "collect_location",
      data: { ...existingData, serviceType: names[serviceId] },
    },
  };
}

function handleContainerSelect(message: string, state: FlowState): BotResponse {
  const t = message.toLowerCase();
  if (/رجوع|رجع|تغيير|قائمة/.test(t)) {
    return {
      reply: "اختر الخدمة اللي تحتاجها 👇",
      messageType: "service_cards",
      cards: SERVICES,
      flowState: { step: "service_type", data: {} },
    };
  }

  const containerId = detectContainer(message);
  if (containerId) {
    const c = CONTAINERS.find((x) => x.id === containerId)!;
    return {
      reply: `ممتاز! اخترت **${c.name} - ${c.size}** (${c.price} ريال/${c.priceNote}) 👍\n\nوين تبغى نوصل الحاوية؟\nأرسل العنوان أو رابط الموقع من قوقل ماب 📍`,
      messageType: "text",
      flowState: {
        step: "collect_location",
        data: { ...state.data, containerSize: `${c.name} - ${c.size}`, containerPrice: c.price },
      },
    };
  }

  return {
    reply: "اختر حجم الحاوية المناسب لمشروعك 👇",
    messageType: "container_cards",
    cards: CONTAINERS,
    flowState: { step: "container_select", data: state.data },
  };
}

function handleCollectLocation(message: string, state: FlowState): BotResponse {
  const location = message.trim();
  if (location.length < 3) {
    return {
      reply: "الرجاء إرسال العنوان بشكل أوضح أو رابط الموقع من قوقل ماب 📍",
      messageType: "text",
      flowState: state,
    };
  }
  return {
    reply: `تم تسجيل الموقع ✅\n\nما اسمك الكريم؟`,
    messageType: "text",
    flowState: { step: "collect_name", data: { ...state.data, location } },
  };
}

function handleCollectName(message: string, state: FlowState): BotResponse {
  const name = message.trim();
  if (name.length < 2) {
    return {
      reply: "الرجاء إدخال اسمك الكريم",
      messageType: "text",
      flowState: state,
    };
  }
  return {
    reply: `أهلاً ${name}! 👋\n\nما رقم جوالك للتواصل؟\nمثال: 05XXXXXXXX`,
    messageType: "text",
    flowState: { step: "collect_phone", data: { ...state.data, name } },
  };
}

function handleCollectPhone(message: string, state: FlowState): BotResponse {
  const phone = message.replace(/[\s\-]/g, "").trim();
  if (phone.length < 9) {
    return {
      reply: "الرجاء إدخال رقم جوال صحيح (مثال: 0555888767)",
      messageType: "text",
      flowState: state,
    };
  }

  const { serviceType, containerSize, containerPrice, location, name } = state.data;
  return {
    reply: "ممتاز! راجع طلبك وأكده 👇",
    messageType: "order_confirm",
    orderData: { serviceType, containerSize, containerPrice, location, name, phone },
    flowState: { step: "confirm", data: { ...state.data, phone } },
  };
}

async function handleConfirm(message: string, intent: string, state: FlowState): Promise<BotResponse> {
  const t = message.toLowerCase();

  if (intent === "confirm" || /تأكيد|ارسل|يلا|ماشي|نعم|اوكي|موافق/.test(t)) {
    const { serviceType, containerSize, location, name, phone } = state.data;

    const [request] = await db
      .insert(serviceRequestsTable)
      .values({
        clientName: name || "غير محدد",
        phone: phone || "",
        serviceType: serviceType || "غير محدد",
        containerSize: containerSize || "",
        location: location || "",
        notes: "طلب عبر البوت الذكي",
      })
      .returning();

    await db
      .insert(notificationsTable)
      .values({
        title: "🤖 طلب جديد عبر البوت الذكي",
        message: `${name} - ${serviceType} - ${location}`,
        type: "service_request",
        refId: request.id,
        refType: "service_request",
      })
      .catch(() => {});

    return {
      reply: `تم إرسال طلبك بنجاح! 🎉`,
      messageType: "success",
      orderData: { orderId: request.id, phone, name, serviceType, location },
      flowState: { step: "done", data: {} },
    };
  }

  if (intent === "cancel" || /لا|تعديل|تغيير|رجع/.test(t)) {
    return {
      reply: "لا بأس! اختر الخدمة من جديد:",
      messageType: "service_cards",
      cards: SERVICES,
      flowState: { step: "service_type", data: {} },
    };
  }

  const { serviceType, containerSize, containerPrice, location, name, phone } = state.data;
  return {
    reply: "راجع طلبك وأكده 👇",
    messageType: "order_confirm",
    orderData: { serviceType, containerSize, containerPrice, location, name, phone },
    flowState: state,
  };
}

async function processMessage(message: string, state: FlowState): Promise<BotResponse> {
  const intent = detectIntent(message);
  const { step } = state;

  // Allow escape to main menu from anywhere
  if (["القائمة الرئيسية", "menu", "رئيسية", "البداية"].includes(message.trim().toLowerCase())) {
    return getWelcomeMessage();
  }

  // Global intents work from any step (except when actively collecting data)
  const collectingSteps = ["collect_location", "collect_name", "collect_phone", "confirm"];
  if (!collectingSteps.includes(step)) {
    if (intent === "about" || intent === "contact" || intent === "prices" || intent === "thanks") {
      return handleMainMenu(message, intent, state);
    }
  }

  switch (step) {
    case "welcome":
    case "main_menu":
      return handleMainMenu(message, intent, state);

    case "service_type":
      return handleServiceType(message, state);

    case "container_select":
      return handleContainerSelect(message, state);

    case "collect_location":
      return handleCollectLocation(message, state);

    case "collect_name":
      return handleCollectName(message, state);

    case "collect_phone":
      return handleCollectPhone(message, state);

    case "confirm":
      return handleConfirm(message, intent, state);

    case "done":
      return {
        reply: "يسعدنا خدمتك! 😊 تريد طلب خدمة جديدة؟",
        messageType: "options",
        options: [
          { label: "اطلب خدمة جديدة", value: "order", emoji: "📦" },
          { label: "رجوع للقائمة", value: "menu", emoji: "🏠" },
        ],
        flowState: { step: "main_menu", data: {} },
      };

    default:
      return getWelcomeMessage();
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.post("/ai/chat", async (req, res) => {
  const { message, conversationId, flowState: rawFlowState } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  const convId: number | null = conversationId || null;

  const flowState: FlowState =
    rawFlowState && typeof rawFlowState === "object"
      ? rawFlowState
      : rawFlowState && typeof rawFlowState === "string"
      ? JSON.parse(rawFlowState)
      : { step: "welcome", data: {} };

  // Persist user message
  if (convId) {
    await db
      .insert(messagesTable)
      .values({ conversationId: convId, content: message, senderType: "client" })
      .catch(() => {});
  }

  const response = await processMessage(message, flowState);

  // Persist bot reply
  if (convId) {
    await db
      .insert(messagesTable)
      .values({ conversationId: convId, content: response.reply, senderType: "ai" })
      .catch(() => {});
    await db
      .update(conversationsTable)
      .set({ lastMessage: response.reply, updatedAt: new Date().toISOString() })
      .where(eq(conversationsTable.id, convId))
      .catch(() => {});
  }

  return res.json({ ...response, conversationId: convId });
});

// Initial greeting endpoint
router.get("/ai/chat/welcome", (_req, res) => {
  return res.json(getWelcomeMessage());
});

export default router;
