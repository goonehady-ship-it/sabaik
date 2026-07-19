/**
 * Seed the SQLite database with initial data for سبائك الماسة.
 * Run with: pnpm --filter @workspace/db run seed
 */
import { db } from "./index";
import {
  heroSlidesTable,
  servicesTable,
  containersTable,
  companyValuesTable,
  testimonialsTable,
  partnersTable,
  notificationsTable,
} from "./schema";

function seedAll() {
  // --- Wipe existing data (in dependency order) ---
  db.delete(notificationsTable).run();
  db.delete(partnersTable).run();
  db.delete(testimonialsTable).run();
  db.delete(companyValuesTable).run();
  db.delete(containersTable).run();
  db.delete(servicesTable).run();
  db.delete(heroSlidesTable).run();

  // --- Hero Slides ---
  const now = new Date().toISOString();
  const slides = [
    {
      title: "حلول ذكية لإدارة المخلفات والأنقاض",
      subtitle: "تأجير حاويات بمختلف الأحجام لمشاريع الهدم والبناء والترميم في الرياض",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80",
      ctaText: "اطلب خدمتك الآن",
      order: 0,
      isActive: true,
      createdAt: now,
    },
    {
      title: "نقل الأنقاض بكفاءة واحترافية",
      subtitle: "أسطول متكامل من المعدات الحديثة يخدمك على مدار الساعة في جميع أنحاء الرياض",
      imageUrl: "https://images.unsplash.com/photo-1581579185974-c0039bd9e7f3?w=1600&q=80",
      ctaText: "تواصل معنا",
      order: 1,
      isActive: true,
      createdAt: now,
    },
    {
      title: "شريككم الموثوق في تأجير الحاويات",
      subtitle: "منذ 2018 ونحن نقدم خدمات استثنائية تواكب رؤية المملكة 2030",
      imageUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1600&q=80",
      ctaText: "اعرف المزيد",
      order: 2,
      isActive: true,
      createdAt: now,
    },
    {
      title: "بيئة نظيفة ومستدامة",
      subtitle: "نساهم في تحسين المشهد الحضري وتقليل الآثار البيئية من خلال حلول متطورة",
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1600&q=80",
      ctaText: "خدماتنا",
      order: 3,
      isActive: true,
      createdAt: now,
    },
  ];
  db.insert(heroSlidesTable).values(slides).run();

  // --- Services ---
  const services = [
    {
      title: "تأجير حاويات مخلفات الهدم",
      description: "نوفر حاويات بمختلف الأحجام لاستيعاب مخلفات الهدم والبناء، مع ضمان الالتزام بمعايير السلامة البيئية.",
      icon: "Box",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      order: 0,
      isActive: true,
    },
    {
      title: "نقل الأنقاض والمخلفات",
      description: "خدمة نقل سريعة وآمنة للأنقاض ومواد الهدم إلى المواقع المخصصة، بأسطول حديث من الشاحنات.",
      icon: "Truck",
      imageUrl: "https://images.unsplash.com/photo-1581579185974-c0039bd9e7f3?w=800&q=80",
      order: 1,
      isActive: true,
    },
    {
      title: "ردم وتسوية الأراضي",
      description: "خدمات ردم المواقع وتسوية الأراضي بعد أعمال الهدم، وفق المواصفات الهندسية المطلوبة.",
      icon: "Layers",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
      order: 2,
      isActive: true,
    },
    {
      title: "تنظيف وتطهير المواقع",
      description: "تنظيف شامل للمواقع الإنشائية بعد انتهاء أعمال البناء أو الهدم، مع التخلص الآمن من المخلفات.",
      icon: "Sparkles",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      order: 3,
      isActive: true,
    },
    {
      title: "خدمات الترميم والصيانة",
      description: "ندعم مشاريع الترميم بتوفير الحاويات اللازمة ونقل المواد القديمة بكفاءة عالية.",
      icon: "Wrench",
      imageUrl: "https://images.unsplash.com/photo-1581579185974-c0039bd9e7f3?w=800&q=80",
      order: 4,
      isActive: true,
    },
    {
      title: "خدمات المصانع والشركات",
      description: "حلول لوجستية متكاملة للمصانع والشركات الكبرى لإدارة النفايات الصناعية والمخلفات بصورة منتظمة.",
      icon: "Factory",
      imageUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
      order: 5,
      isActive: true,
    },
  ];
  db.insert(servicesTable).values(services).run();

  // --- Containers ---
  const containers = [
    {
      name: "حاوية صغيرة",
      size: "4 م³",
      capacity: "مناسبة للمنازل والمحلات",
      description: "مثالية للمشاريع الصغيرة وأعمال ترميم المنازل، سهلة التوضع في الأماكن الضيقة.",
      features: ["مناسبة للمشاريع الصغيرة", "سهلة التوضع", "توصيل ورفع سريع", "24 ساعة خدمة"],
      pricePerDay: 150,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      order: 0,
      isActive: true,
    },
    {
      name: "حاوية متوسطة",
      size: "6 م³",
      capacity: "للمشاريع المتوسطة",
      description: "الخيار الأمثل لأعمال البناء والترميم المتوسطة الحجم، توازن مثالي بين السعة وسهولة التوضع.",
      features: ["سعة مناسبة", "للمشاريع المتوسطة", "جدران مقواة", "سهولة التحميل"],
      pricePerDay: 200,
      imageUrl: "https://images.unsplash.com/photo-1581579185974-c0039bd9e7f3?w=600&q=80",
      order: 1,
      isActive: true,
    },
    {
      name: "حاوية كبيرة",
      size: "8 م³",
      capacity: "لمشاريع الهدم الكبيرة",
      description: "مخصصة لمشاريع الهدم الكبيرة والمواقع الإنشائية الضخمة، تستوعب كميات كبيرة من الأنقاض.",
      features: ["سعة كبيرة", "لمشاريع الهدم", "هيكل متين", "تحميل آلي"],
      pricePerDay: 280,
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
      order: 2,
      isActive: true,
    },
    {
      name: "حاوية كبيرة جداً",
      size: "12 م³",
      capacity: "للمشاريع الضخمة",
      description: "أكبر حاوياتنا، مثالية للمشاريع الكبرى والمصانع والمجمعات التجارية، أقصى سعة بأفضل كفاءة.",
      features: ["أقصى سعة", "للمشاريع الضخمة", "للمصانع والشركات", "خدمة دورية متاحة"],
      pricePerDay: 380,
      imageUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&q=80",
      order: 3,
      isActive: true,
    },
  ];
  db.insert(containersTable).values(containers).run();

  // --- Company Values ---
  const values = [
    {
      title: "الثقة والأمان",
      description: "نعمل وفق أعلى معايير المصداقية والالتزام لضمان راحة عملائنا في جميع مراحل الخدمة.",
      icon: "Shield",
      order: 0,
    },
    {
      title: "السرعة والدقة",
      description: "نؤمن بأن الوقت عنصر أساسي في نجاح المشاريع، لذلك نحرص على سرعة التنفيذ ودقة الأداء.",
      icon: "Zap",
      order: 1,
    },
    {
      title: "الجودة العالية",
      description: "نستخدم أفضل المعدات والحاويات لضمان تقديم خدمة احترافية تلبي أعلى التوقعات.",
      icon: "Star",
      order: 2,
    },
    {
      title: "الاستدامة البيئية",
      description: "نسهم في المحافظة على البيئة والحد من آثار التلوث من خلال حلول متطورة وصديقة للبيئة.",
      icon: "Leaf",
      order: 3,
    },
    {
      title: "خدمة ما بعد التعاقد",
      description: "علاقتنا مع العميل لا تنتهي بانتهاء الخدمة، بل تمتد لتوفير الدعم والمتابعة المستمرة.",
      icon: "Heart",
      order: 4,
    },
  ];
  db.insert(companyValuesTable).values(values).run();

  // --- Testimonials ---
  const testimonials = [
    {
      clientName: "المهندس أحمد الشمري",
      company: "شركة الشمري للمقاولات",
      content: "خدمة ممتازة وسريعة، التزموا بالموعد المحدد وكانت الحاويات نظيفة وجاهزة. سنتعامل معهم مجدداً في مشاريعنا القادمة.",
      rating: 5,
      avatarUrl: null,
      isActive: true,
      createdAt: now,
    },
    {
      clientName: "عبدالله العتيبي",
      company: "مشروع تجاري شخصي",
      content: "استأجرت حاوية لمشروع ترميم منزلي، وكانت التجربة رائعة. الفريق محترف والأسعار معقولة جداً مقارنة بالمنافسين.",
      rating: 5,
      avatarUrl: null,
      isActive: true,
      createdAt: now,
    },
    {
      clientName: "م. سارة القحطاني",
      company: "مكتب هندسي",
      content: "نتعامل مع سبائك الماسة منذ سنتين لجميع مشاريعنا الهندسية. خدمة لا تقبل المقارنة ودائماً في الموعد المحدد.",
      rating: 5,
      avatarUrl: null,
      isActive: true,
      createdAt: now,
    },
    {
      clientName: "خالد الدوسري",
      company: "مقاولات الدوسري",
      content: "تعاملت مع شركات عديدة لكن سبائك الماسة الأفضل على الإطلاق. سرعة في الاستجابة وجودة في الخدمة ومرونة في التعامل.",
      rating: 5,
      avatarUrl: null,
      isActive: true,
      createdAt: now,
    },
    {
      clientName: "فهد المالكي",
      company: "مجموعة المالكي العقارية",
      content: "نثق في سبائك الماسة لجميع مشاريعنا العقارية. حاويات متنوعة وأسطول حديث وخدمة 24 ساعة. شركاء موثوقون حقاً.",
      rating: 5,
      avatarUrl: null,
      isActive: true,
      createdAt: now,
    },
  ];
  db.insert(testimonialsTable).values(testimonials).run();

  // --- Partners ---
  const partners = [
    {
      name: "الرياض مول",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Riyadh_Gallery_Logo.svg/200px-Riyadh_Gallery_Logo.svg.png",
      websiteUrl: null,
      order: 0,
      isActive: true,
    },
    {
      name: "أرامكو السعودية",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Saudi_Aramco.svg/200px-Saudi_Aramco.svg.png",
      websiteUrl: null,
      order: 1,
      isActive: true,
    },
    {
      name: "شركة المياه الوطنية",
      logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80",
      websiteUrl: null,
      order: 2,
      isActive: true,
    },
    {
      name: "بن لادن للمقاولات",
      logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&q=80",
      websiteUrl: null,
      order: 3,
      isActive: true,
    },
    {
      name: "الراجحي للمقاولات",
      logoUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=80",
      websiteUrl: null,
      order: 4,
      isActive: true,
    },
    {
      name: "مجموعة العثيم",
      logoUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=200&q=80",
      websiteUrl: null,
      order: 5,
      isActive: true,
    },
  ];
  db.insert(partnersTable).values(partners).run();

  // --- Sample Notifications ---
  const notifications = [
    {
      title: "طلب جديد",
      message: "تم استلام طلب خدمة جديد من العميل أحمد محمد",
      type: "request",
      refType: "service_request",
      createdAt: now,
    },
    {
      title: "مرحباً بك في لوحة الإدارة",
      message: "تم تجهيز النظام بالبيانات الأولية. يمكنك الآن إدارة جميع أقسام الموقع.",
      type: "system",
      createdAt: now,
    },
  ];
  db.insert(notificationsTable).values(notifications).run();

  console.log("✅ Database seeded successfully!");
  console.log("  - Hero slides: ", slides.length);
  console.log("  - Services: ", services.length);
  console.log("  - Containers: ", containers.length);
  console.log("  - Company values: ", values.length);
  console.log("  - Testimonials: ", testimonials.length);
  console.log("  - Partners: ", partners.length);
  console.log("  - Notifications: ", notifications.length);
}

seedAll();
