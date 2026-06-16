const pptxgen = require("pptxgenjs");

const DARK = "0A1628";
const PRIMARY = "065A82";
const TEAL = "1C7293";
const ACCENT = "02C39A";
const LIGHT = "EAF4FB";
const WHITE = "FFFFFF";
const GRAY = "64748B";
const LGRAY = "E2E8F0";

function makeShadow() {
  return { type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.15 };
}

function addSlideHeader(slide, pres, title, subtitle) {
  slide.background = { color: WHITE };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: PRIMARY } });
  slide.addText(title, { x: 0.4, y: 0.18, w: 7.5, h: 0.7, fontSize: 24, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.4, y: 0.72, w: 8, h: 0.35, fontSize: 11, color: "A8D8EA", fontFace: "Calibri", margin: 0 });
  }
}

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "C4 - Diagrama de Componentes";

// Slide 1: Title
let s1 = pres.addSlide();
s1.background = { color: DARK };
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.3, w: 10, h: 1.325, fill: { color: TEAL } });
s1.addText("Diagrama de Componentes", { x: 0.6, y: 0.9, w: 8.8, h: 1.0, fontSize: 40, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s1.addText("Modelo C4 — Nivel 3", { x: 0.6, y: 2.0, w: 8.8, h: 0.6, fontSize: 22, color: ACCENT, fontFace: "Calibri", align: "center" });
s1.addText("Microservicio de Gamificación | EciWise 2", { x: 0.6, y: 2.75, w: 8.8, h: 0.45, fontSize: 16, color: "A8D8EA", fontFace: "Calibri", align: "center" });
s1.addText("Arquitectura Hexagonal — Puertos y Adaptadores", { x: 0.6, y: 4.55, w: 8.8, h: 0.4, fontSize: 13, color: LGRAY, fontFace: "Calibri", align: "center" });
s1.addNotes("Nivel 3 del modelo C4: los componentes internos del API Container. Muestra las capas de la arquitectura hexagonal.");

// Slide 2: Arquitectura hexagonal overview
let s2 = pres.addSlide();
addSlideHeader(s2, pres, "Arquitectura Hexagonal — 4 Capas", "Separación de responsabilidades por capas concéntricas");
const layers = [
  { name: "Gamification.Domain", desc: "Aggregates, Entities, Value Objects, Domain Events, Ports (interfaces de repositorio)", color: "21295C", proj: "Sin dependencias externas" },
  { name: "Gamification.Application", desc: "Commands, Queries, Handlers (MediatR). Orquesta el dominio sin conocer infraestructura.", color: PRIMARY, proj: "Depende: Domain" },
  { name: "Gamification.Infrastructure", desc: "Repositories (EF Core), Cache (Redis), Messaging (RabbitMQ). Implementa los ports del dominio.", color: TEAL, proj: "Depende: Domain, Application" },
  { name: "Gamification.Api", desc: "Controllers, Program.cs, Background Services. Punto de entrada HTTP y configuración de DI.", color: "028090", proj: "Depende: todas las capas" },
];
layers.forEach((l, i) => {
  const x = 0.3 + i * 0.5;
  const w = 9.4 - i * 1.0;
  const y = 1.2 + i * 0.85;
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.78, fill: { color: l.color }, rectRadius: 0.1, shadow: makeShadow() });
  s2.addText(l.name, { x: x + 0.12, y: y + 0.06, w: w * 0.38, h: 0.28, fontSize: 12, bold: true, color: WHITE, fontFace: "Cambria", margin: 0 });
  s2.addText(l.desc, { x: x + 0.12, y: y + 0.36, w: w * 0.72, h: 0.36, fontSize: 9.5, color: LGRAY, fontFace: "Calibri" });
  s2.addText(l.proj, { x: x + w * 0.76, y: y + 0.18, w: w * 0.22, h: 0.4, fontSize: 8.5, color: ACCENT, fontFace: "Calibri", align: "right", italic: true });
});
s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 4.65, w: 9.4, h: 0.6, fill: { color: LIGHT }, rectRadius: 0.08 });
s2.addText("Regla de dependencia: Las capas internas NO conocen las capas externas. El Domain nunca referencia Infrastructure.", {
  x: 0.5, y: 4.7, w: 9.0, h: 0.5, fontSize: 11, color: PRIMARY, fontFace: "Calibri", italic: true, bold: true
});
s2.addNotes("La regla más importante: las dependencias van hacia adentro. Domain no conoce Application, Application no conoce Infrastructure.");

// Slide 3: Capa Domain — Componentes
let s3 = pres.addSlide();
addSlideHeader(s3, pres, "Gamification.Domain — Componentes", "Núcleo del negocio: sin dependencias externas");
const domainComponents = [
  { cat: "Aggregates", color: "21295C", items: ["AggregateRoot (base)", "UserGamification ← raíz principal", "AchievementDefinition", "Ranking"] },
  { cat: "Entities", color: PRIMARY, items: ["Entity (base)", "PointTransaction", "LevelDefinition", "UserAchievement", "UserLevelHistory", "WeeklyActivity", "GamificationRule", "RankingEntry"] },
  { cat: "Value Objects", color: TEAL, items: ["ValueObject (base)", "Points, UserId", "ReputationScore", "UserActionStat", "AchievementContext", "CriteriaConfig, DateRange", "SubjectCode, EventDescription", "IdempotencyKey, UserRankingData"] },
  { cat: "Domain Events", color: "028090", items: ["DomainEvent (base)", "PointsAddedEvent", "AchievementUnlockedEvent", "LevelUpEvent", "LowRatingAlertEvent"] },
  { cat: "Domain Services", color: "065A82", items: ["GamificationDomainService", "IAchievementStrategy (port)", "IAchievementStrategyFactory", "AchievementStrategies (4 impl.)"] },
  { cat: "Ports (Repos)", color: "6D2E46", items: ["IUserGamificationRepository", "IAchievementDefinitionRepository", "IGamificationRuleRepository", "IRankingRepository", "IWeeklyActivityRepository"] },
];
const colW2 = 2.95, rowH2 = 1.95;
domainComponents.forEach((c, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = 0.28 + col * (colW2 + 0.15);
  const y = 1.2 + row * (rowH2 + 0.12);
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: colW2, h: rowH2, fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow() });
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: colW2, h: 0.38, fill: { color: c.color }, rectRadius: 0.1 });
  s3.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.28, w: colW2, h: 0.1, fill: { color: c.color } });
  s3.addText(c.cat, { x: x + 0.1, y: y + 0.06, w: colW2 - 0.2, h: 0.28, fontSize: 11, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  const textItems = c.items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < c.items.length - 1, fontSize: 9, color: "1E293B", fontFace: "Calibri" } }));
  s3.addText(textItems, { x: x + 0.1, y: y + 0.44, w: colW2 - 0.2, h: rowH2 - 0.52, valign: "top" });
});
s3.addNotes("El Domain tiene 6 tipos de componentes. UserGamification es el aggregate root principal. Los Ports son interfaces que Infrastructure implementará.");

// Slide 4: Capa Application — CQRS
let s4 = pres.addSlide();
addSlideHeader(s4, pres, "Gamification.Application — CQRS con MediatR", "Casos de uso: Commands y Queries separados por intención");
// Commands side
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.2, w: 4.6, h: 4.1, fill: { color: LIGHT }, rectRadius: 0.12 });
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.2, w: 4.6, h: 0.45, fill: { color: PRIMARY }, rectRadius: 0.12 });
s4.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.5, w: 4.6, h: 0.15, fill: { color: PRIMARY } });
s4.addText("COMMANDS — Escriben Estado", { x: 0.45, y: 1.25, w: 4.3, h: 0.3, fontSize: 12, bold: true, color: WHITE, fontFace: "Calibri" });
const commands = [
  { name: "AssignPointsCommand", type: "IRequest<bool>", fields: "userId: Guid\npoints: int\nactionType: ActionType\nsourceEventId: Guid", handler: "AssignPointsCommandHandler", flow: "→ GetByUserId → AddPoints → SaveAsync" },
  { name: "UnlockAchievementCommand", type: "IRequest<bool>", fields: "userId: Guid\nachievementId: Guid\ncontext: AchievementContext", handler: "(Handler registrado)", flow: "→ Unlock Achievement en Aggregate" },
];
commands.forEach((c, i) => {
  const y = 1.75 + i * 1.7;
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.45, y, w: 4.3, h: 1.5, fill: { color: WHITE }, rectRadius: 0.08, shadow: makeShadow() });
  s4.addText(c.name, { x: 0.55, y: y + 0.06, w: 2.8, h: 0.28, fontSize: 11, bold: true, color: PRIMARY, fontFace: "Calibri" });
  s4.addText(c.type, { x: 3.35, y: y + 0.06, w: 1.3, h: 0.25, fontSize: 8.5, color: TEAL, fontFace: "Calibri", align: "right", italic: true });
  s4.addShape(pres.shapes.LINE, { x: 0.55, y: y + 0.38, w: 4.1, h: 0, line: { color: LGRAY, width: 0.75 } });
  s4.addText(`Campos: ${c.fields}`, { x: 0.55, y: y + 0.45, w: 4.1, h: 0.45, fontSize: 8.5, color: "334155", fontFace: "Calibri" });
  s4.addText(`Handler: ${c.handler}`, { x: 0.55, y: y + 0.92, w: 4.1, h: 0.22, fontSize: 8.5, bold: true, color: TEAL, fontFace: "Calibri" });
  s4.addText(c.flow, { x: 0.55, y: y + 1.15, w: 4.1, h: 0.28, fontSize: 8, color: GRAY, fontFace: "Calibri", italic: true });
});
// Queries side
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.1, y: 1.2, w: 4.6, h: 4.1, fill: { color: LIGHT }, rectRadius: 0.12 });
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.1, y: 1.2, w: 4.6, h: 0.45, fill: { color: TEAL }, rectRadius: 0.12 });
s4.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.5, w: 4.6, h: 0.15, fill: { color: TEAL } });
s4.addText("QUERIES — Solo Leen Estado", { x: 5.25, y: 1.25, w: 4.3, h: 0.3, fontSize: 12, bold: true, color: WHITE, fontFace: "Calibri" });
const queries = [
  { name: "GetUserRankingQuery", type: "IRequest<UserRankingDto?>", fields: "userId: Guid\ntype: RankingType", handler: "RankingQueryHandlers", flow: "→ GetCurrentAsync → GetUserPosition" },
  { name: "GetUserAchievementsQuery", type: "IRequest<List<Achievement>>", fields: "userId: Guid", handler: "RankingQueryHandlers", flow: "→ Query UserAchievements" },
  { name: "GetTopRankingQuery", type: "IRequest<List<RankingEntry>>", fields: "type: RankingType\nsubjectCode: string?", handler: "RankingQueryHandlers", flow: "→ Cache → DB fallback" },
];
queries.forEach((q, i) => {
  const y = 1.75 + i * 1.1;
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.25, y, w: 4.3, h: 1.0, fill: { color: WHITE }, rectRadius: 0.08, shadow: makeShadow() });
  s4.addText(q.name, { x: 5.35, y: y + 0.06, w: 2.8, h: 0.25, fontSize: 10, bold: true, color: TEAL, fontFace: "Calibri" });
  s4.addText(q.type, { x: 5.35, y: y + 0.3, w: 4.1, h: 0.22, fontSize: 8, color: GRAY, fontFace: "Calibri", italic: true });
  s4.addShape(pres.shapes.LINE, { x: 5.35, y: y + 0.55, w: 4.1, h: 0, line: { color: LGRAY, width: 0.75 } });
  s4.addText(`Handler: ${q.handler}  |  ${q.flow}`, { x: 5.35, y: y + 0.62, w: 4.1, h: 0.3, fontSize: 8.5, color: "334155", fontFace: "Calibri" });
});
s4.addNotes("CQRS divide operaciones en Commands (escriben estado) y Queries (solo leen). MediatR enruta cada uno a su handler. Esto permite escalar de forma independiente.");

// Slide 5: Capa Infrastructure
let s5 = pres.addSlide();
addSlideHeader(s5, pres, "Gamification.Infrastructure — Adaptadores", "Implementaciones concretas de los Ports del Domain");
const infraGroups = [
  {
    title: "Persistence / Repositories", color: "336791",
    items: ["AppDbContext: DbContext EF Core con 12 DbSets", "UserGamificationRepository → IUserGamificationRepository", "AchievementDefinitionRepository → IAchievementDefinitionRepository", "GamificationRuleRepository → IGamificationRuleRepository", "RankingRepository → IRankingRepository"],
    note: "Implementan interfaces del Domain"
  },
  {
    title: "Messaging", color: "FF6600",
    items: ["RabbitMqConsumer: BackgroundService, escucha gamification_events_queue", "  → Deserializa LessonCompleted → AssignPointsCommand", "  → Verifica idempotencia en processed_events", "RabbitMqProducer: IRabbitMqProducer", "  → Serializa y publica a exchange/queue"],
    note: "Consumer + Producer desacoplados"
  },
  {
    title: "Cache", color: "CC0000",
    items: ["RedisRankingCache → IRankingCache", "GetTopRankingsAsync(type, subjectCode)", "SetTopRankingsAsync(type, subjectCode, data)", "InvalidateRankingAsync(type, subjectCode)", "Clave: ranking:{type}[:{subjectCode}], TTL: 10min"],
    note: "Cache-aside pattern"
  },
  {
    title: "Background Workers", color: "21295C",
    items: ["OutboxWorker: BackgroundService (cada 5s)", "  → Lee outbox sin ProcessedAt", "  → Publica via RabbitMqProducer", "  → Marca ProcessedAt, reintento ≤5", "RankingJob: BackgroundService (cada 24h)", "  → Recalcula Top 100, invalida Redis cache"],
    note: "Patrón Outbox + Ranking periódico"
  },
];
infraGroups.forEach((g, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.3 + col * 5.0, y = 1.2 + row * 2.2;
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.6, h: 2.05, fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow() });
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.6, h: 0.38, fill: { color: g.color }, rectRadius: 0.1 });
  s5.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.28, w: 4.6, h: 0.1, fill: { color: g.color } });
  s5.addText(g.title, { x: x + 0.1, y: y + 0.05, w: 3.5, h: 0.28, fontSize: 11, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  s5.addText(g.note, { x: x + 3.6, y: y + 0.05, w: 0.9, h: 0.28, fontSize: 7.5, color: WHITE, fontFace: "Calibri", align: "right", italic: true, margin: 0 });
  const textItems = g.items.map((t, j) => ({ text: t, options: { bullet: t.startsWith("  ") ? false : true, breakLine: j < g.items.length - 1, fontSize: 9, color: t.startsWith("  ") ? GRAY : "1E293B", fontFace: "Calibri" } }));
  s5.addText(textItems, { x: x + 0.1, y: y + 0.44, w: 4.38, h: 1.55, valign: "top" });
});
s5.addNotes("Infrastructure implementa todos los Ports definidos en Domain. Nunca al revés: Domain nunca referencia Infrastructure.");

// Slide 6: Ports & Adapters
let s6 = pres.addSlide();
addSlideHeader(s6, pres, "Puertos y Adaptadores — Hexagonal Architecture", "Domain define interfaces (Ports); Infrastructure las implementa (Adapters)");
const ports = [
  { port: "IUserGamificationRepository", adapter: "UserGamificationRepository", tech: "EF Core + PostgreSQL" },
  { port: "IAchievementDefinitionRepository", adapter: "AchievementDefinitionRepository", tech: "EF Core + PostgreSQL" },
  { port: "IGamificationRuleRepository", adapter: "GamificationRuleRepository", tech: "EF Core + PostgreSQL" },
  { port: "IRankingRepository", adapter: "RankingRepository", tech: "EF Core + PostgreSQL" },
  { port: "IRankingCache", adapter: "RedisRankingCache", tech: "StackExchange.Redis" },
  { port: "IRabbitMqProducer", adapter: "RabbitMqProducer", tech: "RabbitMQ.Client" },
  { port: "IAchievementStrategy", adapter: "First/Active/Outstanding/MentorStrategy", tech: "Strategy Pattern (Domain)" },
];
// Left column header
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.2, w: 3.6, h: 0.38, fill: { color: "21295C" }, rectRadius: 0.08 });
s6.addText("PORT (Interface — Domain)", { x: 0.3, y: 1.2, w: 3.6, h: 0.38, fontSize: 12, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
// Right column header
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.1, y: 1.2, w: 3.6, h: 0.38, fill: { color: TEAL }, rectRadius: 0.08 });
s6.addText("ADAPTER (Implementation — Infrastructure)", { x: 6.1, y: 1.2, w: 3.6, h: 0.38, fontSize: 11, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
ports.forEach((p, i) => {
  const y = 1.7 + i * 0.52;
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y, w: 3.6, h: 0.44, fill: { color: LIGHT }, rectRadius: 0.07 });
  s6.addText(p.port, { x: 0.4, y: y + 0.08, w: 3.4, h: 0.28, fontSize: 9.5, bold: true, color: "21295C", fontFace: "Calibri" });
  // Arrow
  s6.addShape(pres.shapes.LINE, { x: 3.9, y: y + 0.22, w: 0.5, h: 0, line: { color: ACCENT, width: 2 } });
  s6.addText("→", { x: 4.3, y: y + 0.1, w: 0.3, h: 0.25, fontSize: 12, bold: true, color: ACCENT, fontFace: "Calibri", align: "center" });
  // Tech badge
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4.65, y: y + 0.08, w: 1.35, h: 0.28, fill: { color: ACCENT }, rectRadius: 0.05 });
  s6.addText(p.tech, { x: 4.65, y: y + 0.08, w: 1.35, h: 0.28, fontSize: 7.5, color: DARK, fontFace: "Calibri", align: "center", valign: "middle", bold: true });
  // Adapter box
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.1, y, w: 3.6, h: 0.44, fill: { color: WHITE }, rectRadius: 0.07, shadow: makeShadow() });
  s6.addText(p.adapter, { x: 6.2, y: y + 0.08, w: 3.4, h: 0.28, fontSize: 9.5, color: TEAL, fontFace: "Calibri" });
});
s6.addNotes("El principio de inversión de dependencias: Domain define los contratos (Ports), Infrastructure los implementa (Adapters). Registrados en DI de Program.cs.");

// Slide 7: Resumen
let s7 = pres.addSlide();
s7.background = { color: DARK };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: TEAL } });
s7.addText("Resumen — Componentes C4", { x: 0.5, y: 0.15, w: 9, h: 0.65, fontSize: 22, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
const sum = [
  { n: "Domain", color: "21295C", t: "6 tipos de componentes: Aggregates, Entities, Value Objects, Events, Domain Services, Ports (interfaces)" },
  { n: "Application", color: PRIMARY, t: "CQRS con MediatR: 2 Commands + 3 Queries + Handlers correspondientes para cada caso de uso" },
  { n: "Infrastructure", color: TEAL, t: "4 Adapters: Repositories (EF Core), Cache (Redis), Messaging (RabbitMQ), Background Workers" },
  { n: "API", color: "028090", t: "2 Controllers REST + DI Configuration (Program.cs) + Swagger + Inicialización de base de datos" },
];
sum.forEach((s, i) => {
  s7.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.15 + i * 0.95, w: 9.2, h: 0.82, fill: { color: s.color }, rectRadius: 0.1, shadow: makeShadow() });
  s7.addText(s.n, { x: 0.55, y: 1.22 + i * 0.95, w: 1.4, h: 0.65, fontSize: 13, bold: true, color: WHITE, fontFace: "Cambria", align: "center", valign: "middle" });
  s7.addShape(pres.shapes.LINE, { x: 1.95, y: 1.3 + i * 0.95, w: 0, h: 0.5, line: { color: WHITE, width: 1 } });
  s7.addText(s.t, { x: 2.1, y: 1.23 + i * 0.95, w: 7.4, h: 0.65, fontSize: 11.5, color: WHITE, fontFace: "Calibri", valign: "middle" });
});
s7.addText("Gamification Service — Diagrama de Componentes C4 (Nivel 3)", { x: 0, y: 5.1, w: 10, h: 0.3, fontSize: 9, color: GRAY, fontFace: "Calibri", align: "center" });
s7.addNotes("Los 4 proyectos .NET representan las 4 capas. Cada capa tiene componentes bien definidos con responsabilidades claras.");

pres.writeFile({ fileName: "D:/ander/Documents/INTERSEMESTRAL/ECIWISE 2/gamification/presentations/03_C4_Componentes.pptx" })
  .then(() => console.log("✅ 03_C4_Componentes.pptx generado"))
  .catch(e => console.error("❌", e));
