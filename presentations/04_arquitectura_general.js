const pptxgen = require("pptxgenjs");

const DARK = "0A1628";
const PRIMARY = "065A82";
const TEAL = "1C7293";
const ACCENT = "02C39A";
const LIGHT = "EAF4FB";
const WHITE = "FFFFFF";
const GRAY = "64748B";
const LGRAY = "E2E8F0";

function makeShadow() { return { type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.15 }; }

function addSlideHeader(slide, pres, title, subtitle) {
  slide.background = { color: WHITE };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: "21295C" } });
  slide.addText(title, { x: 0.4, y: 0.18, w: 7.5, h: 0.7, fontSize: 24, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.4, y: 0.72, w: 8, h: 0.35, fontSize: 11, color: "A8D8EA", fontFace: "Calibri", margin: 0 });
  }
}

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Arquitectura General";

// Slide 1: Title
let s1 = pres.addSlide();
s1.background = { color: DARK };
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.3, w: 10, h: 1.325, fill: { color: "21295C" } });
s1.addText("Arquitectura General", { x: 0.6, y: 0.8, w: 8.8, h: 1.0, fontSize: 42, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s1.addText("Hexagonal Architecture (Ports & Adapters)", { x: 0.6, y: 1.95, w: 8.8, h: 0.6, fontSize: 22, color: ACCENT, fontFace: "Calibri", align: "center" });
s1.addText("Microservicio de Gamificación | EciWise 2", { x: 0.6, y: 2.7, w: 8.8, h: 0.45, fontSize: 16, color: "A8D8EA", fontFace: "Calibri", align: "center" });
s1.addText("DDD • CQRS • Clean Architecture • Event-Driven", { x: 0.6, y: 4.55, w: 8.8, h: 0.4, fontSize: 13, color: ACCENT, fontFace: "Calibri", align: "center" });
s1.addNotes("Visión general de la arquitectura del Gamification Service. Combina Arquitectura Hexagonal, DDD, CQRS y Event-Driven Design.");

// Slide 2: Principios arquitectónicos
let s2 = pres.addSlide();
addSlideHeader(s2, pres, "Principios Arquitectónicos", "Decisiones de diseño que guían la estructura del sistema");
const principles = [
  { name: "Hexagonal Architecture", icon: "⬡", desc: "El dominio en el centro. Puertos hacia afuera. Adaptadores en la periferia. Las dependencias apuntan hacia adentro.", benefit: "Testabilidad y reemplazabilidad de infraestructura", color: "21295C" },
  { name: "Domain-Driven Design", icon: "◈", desc: "Aggregates (UserGamification, Ranking), Entities, Value Objects, Domain Events. El lenguaje ubiquo refleja el dominio.", benefit: "Modelo rico en el negocio", color: PRIMARY },
  { name: "CQRS", icon: "⇄", desc: "Commands (AssignPoints, UnlockAchievement) separan escritura de Queries (GetRanking, GetAchievements). MediatR como bus.", benefit: "Escalabilidad y claridad de intención", color: TEAL },
  { name: "Event-Driven", icon: "⚡", desc: "Domain Events internos. Outbox Pattern para publicación confiable. RabbitMQ para mensajería asincrónica entre microservicios.", benefit: "Desacoplamiento entre servicios", color: "028090" },
  { name: "Outbox Pattern", icon: "📤", desc: "Los eventos de dominio se escriben en una tabla outbox junto a los cambios de negocio en la misma transacción. OutboxWorker los publica.", benefit: "Consistencia eventual garantizada", color: "6D2E46" },
  { name: "Idempotencia", icon: "🔑", desc: "IdempotencyKey = sourceEventId + actionType. processed_events evita procesar el mismo evento dos veces si RabbitMQ reintenta.", benefit: "Exactly-once semantics", color: "065A82" },
];
principles.forEach((p, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = 0.25 + col * 3.2, y = 1.2 + row * 2.05;
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.05, h: 1.9, fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow() });
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.05, h: 0.42, fill: { color: p.color }, rectRadius: 0.1 });
  s2.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.32, w: 3.05, h: 0.1, fill: { color: p.color } });
  s2.addText(p.name, { x: x + 0.1, y: y + 0.07, w: 2.85, h: 0.28, fontSize: 10.5, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  s2.addText(p.desc, { x: x + 0.1, y: y + 0.48, w: 2.85, h: 0.78, fontSize: 8.5, color: "334155", fontFace: "Calibri" });
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.1, y: y + 1.35, w: 2.85, h: 0.4, fill: { color: LIGHT }, rectRadius: 0.06 });
  s2.addText("✓ " + p.benefit, { x: x + 0.15, y: y + 1.38, w: 2.75, h: 0.32, fontSize: 8, bold: true, color: p.color, fontFace: "Calibri" });
});
s2.addNotes("6 principios clave. La combinación crea un sistema mantenible, testable y escalable.");

// Slide 3: Vista de capas y proyectos
let s3 = pres.addSlide();
addSlideHeader(s3, pres, "Estructura de Proyectos .NET", "4 proyectos en la solución — Gamification.slnx");
// Solution box
s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.2, y: 1.15, w: 9.6, h: 4.15, fill: { color: "F8FAFC" }, rectRadius: 0.15 });
s3.addText("Gamification.slnx (.NET 10 Solution)", { x: 0.35, y: 1.2, w: 9.3, h: 0.3, fontSize: 10, bold: true, color: GRAY, fontFace: "Calibri", italic: true });
const projects = [
  {
    name: "Gamification.Domain", x: 0.4, y: 1.6, w: 2.1, color: "21295C",
    content: ["Aggregates/", "Entities/", "ValueObjects/", "Events/", "Services/", "Repositories/ (interfaces)", "Enums/"],
    note: "0 dependencias NuGet"
  },
  {
    name: "Gamification.Application", x: 2.65, y: 1.6, w: 2.4, color: PRIMARY,
    content: ["Commands/", "Queries/", "Handlers/", "→ MediatR", "→ Ref: Domain"],
    note: "Depende: Domain"
  },
  {
    name: "Gamification.Infrastructure", x: 5.2, y: 1.6, w: 2.5, color: TEAL,
    content: ["Persistence/", " ├ AppDbContext", " ├ Repositories/", " └ Workers/", "Messaging/", "Cache/", "→ Ref: Domain, App"],
    note: "Depende: Domain, App"
  },
  {
    name: "Gamification.Api", x: 7.85, y: 1.6, w: 1.75, color: "028090",
    content: ["Controllers/", "Program.cs", "appsettings.json", "→ Ref: todas"],
    note: "Entry point"
  },
];
projects.forEach(p => {
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: p.x, y: p.y, w: p.w, h: 3.5, fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow() });
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: p.x, y: p.y, w: p.w, h: 0.42, fill: { color: p.color }, rectRadius: 0.1 });
  s3.addShape(pres.shapes.RECTANGLE, { x: p.x, y: p.y + 0.32, w: p.w, h: 0.1, fill: { color: p.color } });
  s3.addText(p.name.replace("Gamification.", ""), { x: p.x + 0.08, y: p.y + 0.06, w: p.w - 0.16, h: 0.26, fontSize: 9.5, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  const textItems = p.content.map((t, j) => ({ text: t, options: { bullet: !t.startsWith(" "), breakLine: j < p.content.length - 1, fontSize: 8.5, color: t.startsWith(" ") ? GRAY : "1E293B", fontFace: "Calibri" } }));
  s3.addText(textItems, { x: p.x + 0.08, y: p.y + 0.5, w: p.w - 0.16, h: 2.6, valign: "top" });
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: p.x + 0.08, y: p.y + 3.18, w: p.w - 0.16, h: 0.25, fill: { color: LIGHT }, rectRadius: 0.05 });
  s3.addText(p.note, { x: p.x + 0.1, y: p.y + 3.2, w: p.w - 0.2, h: 0.22, fontSize: 8, bold: true, color: p.color, fontFace: "Calibri", align: "center" });
});
// Dependency arrows
s3.addShape(pres.shapes.LINE, { x: 2.5, y: 3.35, w: 0.15, h: 0, line: { color: "21295C", width: 1.5 } });
s3.addShape(pres.shapes.LINE, { x: 5.05, y: 3.35, w: 0.15, h: 0, line: { color: PRIMARY, width: 1.5 } });
s3.addShape(pres.shapes.LINE, { x: 7.7, y: 3.35, w: 0.15, h: 0, line: { color: TEAL, width: 1.5 } });
s3.addNotes("4 proyectos con dependencias unidireccionales. Domain no conoce ningún otro proyecto. API conoce todos pero nunca toca Domain directamente.");

// Slide 4: Flujo de una petición HTTP
let s4 = pres.addSlide();
addSlideHeader(s4, pres, "Flujo de una Petición HTTP — Assign Points", "De la cola RabbitMQ al almacenamiento en PostgreSQL");
const steps = [
  { n: "1", label: "RabbitMQ\nConsumer", desc: "RabbitMqConsumer recibe\nLessonCompleted event\ndel broker", color: "FF6600", x: 0.2, y: 1.3 },
  { n: "2", label: "Idempotencia\nCheck", desc: "Verifica processed_events.\nSi ya existe → Ack y termina.\nSi no → continúa", color: "6D2E46", x: 2.05, y: 1.3 },
  { n: "3", label: "MediatR\nCommand", desc: "Crea AssignPointsCommand\n(userId, points, actionType)\nSend via IMediator", color: PRIMARY, x: 3.9, y: 1.3 },
  { n: "4", label: "Command\nHandler", desc: "Fetch UserGamification\nLlama domain.AddPoints()\nRaise PointsAddedEvent", color: "21295C", x: 5.75, y: 1.3 },
  { n: "5", label: "Repository\nSave", desc: "AppDbContext.SaveChanges()\nPersiste en PostgreSQL:\nuser_gamification + outbox", color: TEAL, x: 7.6, y: 1.3 },
];
const stepW = 1.75, stepH = 2.5;
steps.forEach((s, i) => {
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: s.x, y: s.y, w: stepW, h: stepH, fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow() });
  s4.addShape(pres.shapes.OVAL, { x: s.x + (stepW - 0.5) / 2, y: s.y - 0.28, w: 0.5, h: 0.5, fill: { color: s.color }, shadow: makeShadow() });
  s4.addText(s.n, { x: s.x + (stepW - 0.5) / 2, y: s.y - 0.28, w: 0.5, h: 0.5, fontSize: 14, bold: true, color: WHITE, fontFace: "Cambria", align: "center", valign: "middle" });
  s4.addText(s.label, { x: s.x + 0.08, y: s.y + 0.12, w: stepW - 0.16, h: 0.6, fontSize: 10, bold: true, color: s.color, fontFace: "Calibri", align: "center" });
  s4.addShape(pres.shapes.LINE, { x: s.x + 0.2, y: s.y + 0.72, w: stepW - 0.4, h: 0, line: { color: LGRAY, width: 0.75 } });
  s4.addText(s.desc, { x: s.x + 0.1, y: s.y + 0.8, w: stepW - 0.2, h: 1.6, fontSize: 9, color: "334155", fontFace: "Calibri", align: "center" });
  if (i < steps.length - 1) {
    s4.addShape(pres.shapes.LINE, { x: s.x + stepW, y: s.y + stepH / 2, w: 0.3, h: 0, line: { color: ACCENT, width: 2 } });
    s4.addText("→", { x: s.x + stepW + 0.02, y: s.y + stepH / 2 - 0.15, w: 0.25, h: 0.25, fontSize: 12, color: ACCENT, fontFace: "Calibri", bold: true });
  }
});
// Outbox step
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.2, y: 4.05, w: 9.6, h: 1.2, fill: { color: LIGHT }, rectRadius: 0.1 });
s4.addText("Fase 2 — OutboxWorker (cada 5 segundos)", { x: 0.35, y: 4.1, w: 9.3, h: 0.28, fontSize: 11, bold: true, color: "6D2E46", fontFace: "Calibri" });
s4.addText("Lee eventos de la tabla outbox sin procesar → Publica via RabbitMqProducer al exchange → Marca ProcessedAt → Si falla, RetryCount++ (máx 5 intentos)", {
  x: 0.35, y: 4.4, w: 9.3, h: 0.78, fontSize: 10, color: "334155", fontFace: "Calibri"
});
s4.addNotes("El flujo principal tiene 5 pasos. El paso 5 escribe en outbox y el OutboxWorker publica de forma asincrónica para garantizar consistencia.");

// Slide 5: Patrones de diseño utilizados
let s5 = pres.addSlide();
addSlideHeader(s5, pres, "Patrones de Diseño Implementados", "Design Patterns aplicados en el Gamification Service");
const patterns = [
  { name: "Repository", layer: "Domain + Infrastructure", desc: "IUserGamificationRepository define el contrato. UserGamificationRepository lo implementa con EF Core. El Domain no conoce SQL.", use: "Abstracción del acceso a datos" },
  { name: "Aggregate Root", layer: "Domain", desc: "UserGamification controla sus entidades internas (PointTransaction, UserAchievement). Solo se modifica a través de métodos del aggregate.", use: "Invariantes del dominio" },
  { name: "Value Object", layer: "Domain", desc: "Points, UserId, DateRange son inmutables y se comparan por valor, no por referencia. Expresan conceptos del dominio con validación.", use: "Inmutabilidad y expresividad" },
  { name: "Domain Event", layer: "Domain", desc: "PointsAddedEvent, AchievementUnlockedEvent, LevelUpEvent se levantan dentro del aggregate y se persistenal outbox en la misma transacción.", use: "Consistencia eventual" },
  { name: "Strategy", layer: "Domain", desc: "IAchievementStrategy define el contrato de evaluación. FirstTutoringStrategy, ActiveCollaboratorStrategy, etc. implementan lógicas distintas.", use: "Algoritmos intercambiables" },
  { name: "Outbox Pattern", layer: "Infrastructure", desc: "Los eventos se escriben en la tabla outbox atómicamente con los cambios. OutboxWorker los publica de forma asincrónica con reintentos.", use: "At-least-once delivery" },
  { name: "CQRS", layer: "Application", desc: "Commands (AssignPointsCommand) separan escritura de Queries (GetUserRankingQuery). MediatR enruta cada tipo a su handler.", use: "Separación de intención" },
  { name: "Cache-Aside", layer: "Infrastructure", desc: "RankingJob actualiza PostgreSQL e invalida Redis. Al leer, si no hay cache (IRankingCache) se va a DB y se actualiza el cache.", use: "Rendimiento en lecturas" },
];
patterns.forEach((p, i) => {
  const col = i % 2, row = Math.floor(i / 4);
  const x = 0.25 + col * 4.9;
  const y = 1.2 + (i % 4) * 0.98;
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.6, h: 0.9, fill: { color: WHITE }, rectRadius: 0.08, shadow: makeShadow() });
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.5, h: 0.9, fill: { color: i % 2 === 0 ? PRIMARY : TEAL }, rectRadius: 0.08 });
  s5.addShape(pres.shapes.RECTANGLE, { x: x + 1.4, y, w: 0.1, h: 0.9, fill: { color: i % 2 === 0 ? PRIMARY : TEAL } });
  s5.addText(p.name, { x: x + 0.05, y: y + 0.08, w: 1.4, h: 0.42, fontSize: 9.5, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
  s5.addText(`[${p.layer}]`, { x: x + 0.05, y: y + 0.55, w: 1.4, h: 0.25, fontSize: 7.5, color: LGRAY, fontFace: "Calibri", align: "center" });
  s5.addText(p.desc, { x: x + 1.6, y: y + 0.05, w: 2.65, h: 0.65, fontSize: 8.5, color: "334155", fontFace: "Calibri" });
  s5.addText(`→ ${p.use}`, { x: x + 1.6, y: y + 0.7, w: 2.65, h: 0.18, fontSize: 8, bold: true, color: i % 2 === 0 ? PRIMARY : TEAL, fontFace: "Calibri" });
});
s5.addNotes("8 patrones de diseño. La combinación forma una arquitectura robusta, mantenible y testable.");

// Slide 6: Stack tecnológico completo
let s6 = pres.addSlide();
addSlideHeader(s6, pres, "Stack Tecnológico Completo", "Tecnologías y frameworks del Gamification Service");
const stack = [
  { cat: "Runtime & Framework", color: PRIMARY, items: [".NET 10 (C#)", "ASP.NET Core Web API", "Entity Framework Core 10", "Npgsql (PostgreSQL driver)"] },
  { cat: "Mensajería & Cache", color: "FF6600", items: ["RabbitMQ.Client 6.x", "StackExchange.Redis 2.x", "Outbox Pattern (custom)", "Background Services (.NET)"] },
  { cat: "Application Layer", color: TEAL, items: ["MediatR 12.x (CQRS)", "IRequest / IRequestHandler", "Scoped + Singleton DI", "Swagger / Swashbuckle"] },
  { cat: "Testing", color: "6D2E46", items: ["xUnit (test framework)", "Moq (mocking library)", "FluentAssertions", "Integration Tests (E2E)"] },
  { cat: "Infraestructura Local", color: "336791", items: ["Docker Compose", "PostgreSQL 15-alpine", "Redis 7-alpine", "RabbitMQ 3.12-management"] },
  { cat: "DevOps & CI/CD", color: "21295C", items: ["GitHub Actions", "CI pipeline (develop branch)", "Build + Test en PR", ".NET CLI tools"] },
];
stack.forEach((s, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = 0.25 + col * 3.25, y = 1.2 + row * 2.1;
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.1, h: 1.95, fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow() });
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.1, h: 0.4, fill: { color: s.color }, rectRadius: 0.1 });
  s6.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.3, w: 3.1, h: 0.1, fill: { color: s.color } });
  s6.addText(s.cat, { x: x + 0.1, y: y + 0.06, w: 2.9, h: 0.28, fontSize: 10.5, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  const items = s.items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < s.items.length - 1, fontSize: 9.5, color: "1E293B", fontFace: "Calibri" } }));
  s6.addText(items, { x: x + 0.1, y: y + 0.47, w: 2.9, h: 1.42, valign: "top" });
});
s6.addNotes("Stack moderno y estándar en el ecosistema .NET. Cada tecnología cumple una función específica en la arquitectura.");

// Slide 7: Resumen arquitectural
let s7 = pres.addSlide();
s7.background = { color: DARK };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: "21295C" } });
s7.addText("Resumen de la Arquitectura General", { x: 0.5, y: 0.15, w: 9, h: 0.65, fontSize: 22, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
const sumItems = [
  { t: "Hexagonal Architecture", d: "Domain en el centro, adaptadores en la periferia. Regla de dependencia: siempre hacia adentro. 4 capas (proyectos .NET).", c: "21295C" },
  { t: "DDD + Value Objects", d: "UserGamification es el Aggregate Root. 10+ Value Objects inmutables. Domain Events para comunicación interna.", c: PRIMARY },
  { t: "CQRS + MediatR", d: "Commands y Queries separados. AssignPointsCommandHandler es el caso de uso principal. Handlers desacoplados de la infraestructura.", c: TEAL },
  { t: "Event-Driven + Outbox", d: "Consistencia eventual garantizada. Outbox Pattern + OutboxWorker para publicación confiable. Idempotencia en processed_events.", c: "028090" },
];
sumItems.forEach((s, i) => {
  s7.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.15 + i * 0.95, w: 9.4, h: 0.82, fill: { color: s.c }, rectRadius: 0.1, shadow: makeShadow() });
  s7.addText(s.t, { x: 0.45, y: 1.22 + i * 0.95, w: 2.3, h: 0.65, fontSize: 12, bold: true, color: WHITE, fontFace: "Cambria", valign: "middle" });
  s7.addShape(pres.shapes.LINE, { x: 2.75, y: 1.3 + i * 0.95, w: 0, h: 0.5, line: { color: WHITE, width: 1 } });
  s7.addText(s.d, { x: 2.9, y: 1.23 + i * 0.95, w: 6.65, h: 0.65, fontSize: 11, color: WHITE, fontFace: "Calibri", valign: "middle" });
});
s7.addText("Gamification Service — Arquitectura General (Hexagonal + DDD + CQRS + Event-Driven)", { x: 0, y: 5.1, w: 10, h: 0.3, fontSize: 9, color: GRAY, fontFace: "Calibri", align: "center" });
s7.addNotes("La arquitectura general combina 4 paradigmas que se complementan para crear un microservicio robusto, mantenible y testable.");

pres.writeFile({ fileName: "D:/ander/Documents/INTERSEMESTRAL/ECIWISE 2/gamification/presentations/04_Arquitectura_General.pptx" })
  .then(() => console.log("✅ 04_Arquitectura_General.pptx generado"))
  .catch(e => console.error("❌", e));
