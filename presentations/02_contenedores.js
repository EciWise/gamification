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
pres.title = "C4 - Diagrama de Contenedores";

// Slide 1: Title
let s1 = pres.addSlide();
s1.background = { color: DARK };
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.3, w: 10, h: 1.325, fill: { color: PRIMARY } });
s1.addText("Diagrama de Contenedores", { x: 0.6, y: 1.0, w: 8.8, h: 1.0, fontSize: 40, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s1.addText("Modelo C4 — Nivel 2", { x: 0.6, y: 2.1, w: 8.8, h: 0.6, fontSize: 22, color: ACCENT, fontFace: "Calibri", align: "center" });
s1.addText("Microservicio de Gamificación | EciWise 2", { x: 0.6, y: 2.8, w: 8.8, h: 0.45, fontSize: 16, color: "A8D8EA", fontFace: "Calibri", align: "center" });
s1.addText("Arquitectura de Software • 2026", { x: 0.6, y: 4.55, w: 8.8, h: 0.4, fontSize: 13, color: LGRAY, fontFace: "Calibri", align: "center" });
s1.addNotes("Slide de título. El Diagrama de Contenedores C4 (Nivel 2) explota el sistema en sus contenedores: aplicaciones, bases de datos, colas, etc.");

// Slide 2: Overview de contenedores
let s2 = pres.addSlide();
addSlideHeader(s2, pres, "Contenedores del Sistema", "¿Qué tecnologías y procesos componen el Gamification Service?");
s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.2, w: 9.4, h: 0.72, fill: { color: LIGHT }, rectRadius: 0.08 });
s2.addText("Un contenedor en C4 es una unidad ejecutable o almacenable que contribuye al sistema. Puede ser una aplicación, una base de datos, una cola de mensajes, etc.", {
  x: 0.5, y: 1.25, w: 9.0, h: 0.62, fontSize: 12, color: PRIMARY, fontFace: "Calibri", italic: true
});
const containers = [
  { name: "API Container", tech: ".NET 10 / ASP.NET Core", desc: "Expone endpoints REST. Punto de entrada HTTP al sistema.", color: PRIMARY },
  { name: "PostgreSQL DB", tech: "PostgreSQL 15", desc: "Base de datos relacional. Almacena toda la información persistente.", color: "336791" },
  { name: "Redis Cache", tech: "Redis 7 Alpine", desc: "Cache distribuido de rankings. TTL 10 minutos.", color: "CC0000" },
  { name: "RabbitMQ Broker", tech: "RabbitMQ 3.12", desc: "Broker de mensajes. Entrada de eventos y salida de dominio.", color: "FF6600" },
];
containers.forEach((c, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.4 + col * 4.85, y = 2.1 + row * 1.6;
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.55, h: 1.4, fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow() });
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.55, h: 0.38, fill: { color: c.color }, rectRadius: 0.1 });
  s2.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.28, w: 4.55, h: 0.1, fill: { color: c.color } });
  s2.addText(c.name, { x: x + 0.12, y: y + 0.05, w: 4.3, h: 0.28, fontSize: 12, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  s2.addText(`[${c.tech}]`, { x: x + 0.12, y: y + 0.44, w: 4.3, h: 0.22, fontSize: 9.5, color: GRAY, fontFace: "Calibri", italic: true });
  s2.addText(c.desc, { x: x + 0.12, y: y + 0.68, w: 4.3, h: 0.6, fontSize: 10, color: "334155", fontFace: "Calibri" });
});
s2.addNotes("El sistema tiene 4 contenedores principales: API (negocio), PostgreSQL (datos), Redis (cache), RabbitMQ (mensajería asincrónica).");

// Slide 3: API Container detalle
let s3 = pres.addSlide();
addSlideHeader(s3, pres, "Contenedor: API (Gamification.Api)", "Punto de entrada HTTP — ASP.NET Core .NET 10");
// Main container box
s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.2, w: 5.5, h: 4.1, fill: { color: LIGHT }, rectRadius: 0.12 });
s3.addText("[Container: .NET 10 / ASP.NET Core]", { x: 0.45, y: 1.25, w: 5.2, h: 0.25, fontSize: 9, color: GRAY, fontFace: "Calibri", italic: true });
s3.addText("Gamification.Api", { x: 0.45, y: 1.5, w: 5.2, h: 0.45, fontSize: 18, bold: true, color: PRIMARY, fontFace: "Cambria" });
// Components inside
const apiComponents = [
  { name: "GamificationController", desc: "GET /api/gamification/users/{id}/ranking\nGET /api/gamification/users/{id}/achievements", color: TEAL },
  { name: "AdminController", desc: "GET /api/admin/rules\n(Reglas de gamificación activas)", color: "028090" },
  { name: "Program.cs (DI)", desc: "Registro de servicios, middleware,\nSwagger, DB init, Background services", color: "065A82" },
  { name: "Background Services", desc: "RabbitMqConsumer, OutboxWorker,\nRankingJob (hosted services)", color: "21295C" },
];
apiComponents.forEach((c, i) => {
  const y = 2.05 + i * 0.8;
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.45, y, w: 5.2, h: 0.72, fill: { color: WHITE }, rectRadius: 0.08, shadow: makeShadow() });
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.45, y, w: 1.3, h: 0.72, fill: { color: c.color }, rectRadius: 0.08 });
  s3.addShape(pres.shapes.RECTANGLE, { x: 1.65, y, w: 0.1, h: 0.72, fill: { color: c.color } });
  s3.addText(c.name, { x: 0.5, y: y + 0.05, w: 1.2, h: 0.62, fontSize: 8, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
  s3.addText(c.desc, { x: 1.85, y: y + 0.08, w: 3.65, h: 0.58, fontSize: 9, color: "334155", fontFace: "Calibri" });
});
// Swagger note
s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.45, y: 5.07, w: 5.2, h: 0.18, fill: { color: ACCENT }, rectRadius: 0.05 });
s3.addText("Swagger UI disponible en /swagger/index.html", { x: 0.5, y: 5.07, w: 5.1, h: 0.18, fontSize: 8.5, bold: true, color: DARK, fontFace: "Calibri", align: "center" });
// Right side: interactions
s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.1, y: 1.2, w: 3.6, h: 4.1, fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow() });
s3.addText("Interacciones", { x: 6.2, y: 1.3, w: 3.4, h: 0.35, fontSize: 14, bold: true, color: PRIMARY, fontFace: "Calibri" });
const interactions = [
  { dir: "← Recibe", what: "HTTP REST desde clientes (Estudiantes, Tutores, Admin)", color: TEAL },
  { dir: "→ Envía", what: "Comandos/Queries a Application Layer via MediatR", color: PRIMARY },
  { dir: "↔ Usa", what: "PostgreSQL via EF Core (Infrastructure)", color: "336791" },
  { dir: "↔ Usa", what: "Redis para ranking cache (IRankingCache)", color: "CC0000" },
  { dir: "← Consume", what: "Mensajes RabbitMQ (gamification_events_queue)", color: "FF6600" },
  { dir: "→ Publica", what: "Eventos de dominio via OutboxWorker → RabbitMQ", color: "FF6600" },
];
interactions.forEach((it, i) => {
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.2, y: 1.75 + i * 0.54, w: 3.4, h: 0.48, fill: { color: LIGHT }, rectRadius: 0.07 });
  s3.addText(it.dir, { x: 6.25, y: 1.78 + i * 0.54, w: 0.75, h: 0.22, fontSize: 8.5, bold: true, color: it.color, fontFace: "Calibri", margin: 0 });
  s3.addText(it.what, { x: 6.25, y: 1.98 + i * 0.54, w: 3.3, h: 0.22, fontSize: 8, color: "334155", fontFace: "Calibri", margin: 0 });
});
s3.addNotes("El contenedor API es el punto de entrada. Orquesta controllers, DI y background services. Swagger documenta la API.");

// Slide 4: Base de Datos
let s4 = pres.addSlide();
addSlideHeader(s4, pres, "Contenedor: PostgreSQL 15", "Base de datos relacional — Almacenamiento persistente del sistema");
// Tables
const tables = [
  { name: "user_gamification", desc: "Aggregate root: userId, totalPoints, currentLevel, reputationScore", key: "PK: Id (Guid)" },
  { name: "point_transactions", desc: "Historial de puntos: userId, points, actionType, sourceEventId, idempotencyKey", key: "PK: Id | FK: userId" },
  { name: "level_definitions", desc: "Definición de niveles: name, minPoints", key: "PK: Id" },
  { name: "achievement_definitions", desc: "Definición de logros: name, description, strategyKey, criteriaConfig, isActive", key: "PK: Id" },
  { name: "user_achievements", desc: "Logros desbloqueados por usuario: userId, achievementId, unlockedAt", key: "FK: userId, achievementId" },
  { name: "rankings", desc: "Rankings calculados: type, period (start/end), subjectCode", key: "PK: Id" },
  { name: "ranking_entries", desc: "Entradas del ranking: userId, position, score, computedAt", key: "FK: rankingId, userId" },
  { name: "gamification_rules", desc: "Reglas: actionType, pointsAwarded, isActive", key: "PK: Id" },
  { name: "outbox", desc: "Outbox pattern: eventType, payload, processedAt, retryCount", key: "PK: Id" },
  { name: "processed_events", desc: "Idempotencia: eventId (idempotencyKey) ya procesados", key: "PK: eventId" },
  { name: "user_action_stats", desc: "Owned by user_gamification: actionType, count, lastUpdated", key: "FK: userId" },
  { name: "user_level_history", desc: "Historial de niveles: userId, level, pointsAtThatMoment, achievedAt", key: "FK: userId" },
];
const cols = 3;
const colW = 3.0, rowH = 0.62, startX = 0.3, startY = 1.2;
tables.forEach((t, i) => {
  const col = i % cols, row = Math.floor(i / cols);
  const x = startX + col * (colW + 0.1);
  const y = startY + row * (rowH + 0.08);
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: colW, h: rowH, fill: { color: WHITE }, rectRadius: 0.07, shadow: makeShadow() });
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: colW, h: 0.26, fill: { color: i < 5 ? PRIMARY : (i < 9 ? TEAL : "028090") }, rectRadius: 0.07 });
  s4.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.18, w: colW, h: 0.08, fill: { color: i < 5 ? PRIMARY : (i < 9 ? TEAL : "028090") } });
  s4.addText(t.name, { x: x + 0.08, y: y + 0.03, w: colW - 0.16, h: 0.2, fontSize: 8.5, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  s4.addText(t.desc, { x: x + 0.08, y: y + 0.28, w: colW - 0.16, h: 0.24, fontSize: 7.5, color: "334155", fontFace: "Calibri" });
  s4.addText(t.key, { x: x + 0.08, y: y + 0.5, w: colW - 0.16, h: 0.1, fontSize: 7, color: GRAY, fontFace: "Calibri", italic: true });
});
s4.addNotes("PostgreSQL tiene 12 tablas. user_gamification es el agregado raíz. outbox y processed_events implementan el patrón Outbox e idempotencia.");

// Slide 5: Redis y RabbitMQ
let s5 = pres.addSlide();
addSlideHeader(s5, pres, "Contenedores: Redis & RabbitMQ", "Cache distribuido y broker de mensajes asincrónicos");

// Redis
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.2, w: 4.5, h: 4.1, fill: { color: WHITE }, rectRadius: 0.12, shadow: makeShadow() });
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.2, w: 4.5, h: 0.5, fill: { color: "CC0000" }, rectRadius: 0.12 });
s5.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.55, w: 4.5, h: 0.15, fill: { color: "CC0000" } });
s5.addText("Redis 7 — Cache Distribuido", { x: 0.45, y: 1.25, w: 4.2, h: 0.38, fontSize: 13, bold: true, color: WHITE, fontFace: "Calibri" });
const redisItems = [
  { label: "Tecnología", val: "StackExchange.Redis" },
  { label: "Puerto", val: "6379" },
  { label: "Patrón de clave", val: "ranking:{type}[:{subjectCode}]" },
  { label: "TTL", val: "10 minutos" },
  { label: "Interfaz", val: "IRankingCache" },
  { label: "Implementación", val: "RedisRankingCache" },
];
redisItems.forEach((item, i) => {
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.45, y: 1.85 + i * 0.5, w: 4.2, h: 0.42, fill: { color: LIGHT }, rectRadius: 0.06 });
  s5.addText(item.label + ":", { x: 0.55, y: 1.88 + i * 0.5, w: 1.4, h: 0.2, fontSize: 9, bold: true, color: "CC0000", fontFace: "Calibri" });
  s5.addText(item.val, { x: 1.95, y: 1.88 + i * 0.5, w: 2.6, h: 0.2, fontSize: 9, color: "334155", fontFace: "Calibri" });
});
s5.addText("Operaciones: GetTopRankingsAsync | SetTopRankingsAsync | InvalidateRankingAsync", {
  x: 0.45, y: 4.88, w: 4.2, h: 0.28, fontSize: 8.5, color: GRAY, fontFace: "Calibri", italic: true
});

// RabbitMQ
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.2, y: 1.2, w: 4.5, h: 4.1, fill: { color: WHITE }, rectRadius: 0.12, shadow: makeShadow() });
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.2, y: 1.2, w: 4.5, h: 0.5, fill: { color: "FF6600" }, rectRadius: 0.12 });
s5.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.55, w: 4.5, h: 0.15, fill: { color: "FF6600" } });
s5.addText("RabbitMQ 3.12 — Message Broker", { x: 5.35, y: 1.25, w: 4.2, h: 0.38, fontSize: 13, bold: true, color: WHITE, fontFace: "Calibri" });
const rbItems = [
  { label: "Cola de entrada", val: "gamification_events_queue (durable)" },
  { label: "Evento entrante", val: "LessonCompleted → AssignPointsCommand" },
  { label: "Eventos salientes", val: "PointsAdded, AchievementUnlocked,\nLevelUp, LowRatingAlert" },
  { label: "Patrón", val: "Outbox Pattern (retry hasta 5 veces)" },
  { label: "Consumer", val: "RabbitMqConsumer (BackgroundService)" },
  { label: "Producer", val: "RabbitMqProducer (IRabbitMqProducer)" },
];
rbItems.forEach((item, i) => {
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.35, y: 1.85 + i * 0.5, w: 4.2, h: 0.42, fill: { color: LIGHT }, rectRadius: 0.06 });
  s5.addText(item.label + ":", { x: 5.45, y: 1.88 + i * 0.5, w: 1.7, h: 0.2, fontSize: 9, bold: true, color: "FF6600", fontFace: "Calibri" });
  s5.addText(item.val, { x: 7.15, y: 1.88 + i * 0.5, w: 2.25, h: 0.35, fontSize: 8.5, color: "334155", fontFace: "Calibri" });
});
s5.addText("Management UI disponible en puerto 15672 (guest/guest)", {
  x: 5.35, y: 4.88, w: 4.2, h: 0.28, fontSize: 8.5, color: GRAY, fontFace: "Calibri", italic: true
});
s5.addNotes("Redis cachea rankings pre-calculados. RabbitMQ desacopla el consumo de eventos externos y la publicación de eventos de dominio via Outbox.");

// Slide 6: Diagrama de Contenedores Visual
let s6 = pres.addSlide();
addSlideHeader(s6, pres, "Vista de Contenedores — Diagrama", "Flujo de datos entre contenedores del Gamification Service");

// Boundary box
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.8, y: 1.15, w: 6.4, h: 4.1, fill: { color: "F0F9FF" }, rectRadius: 0.15 });
s6.addText("Gamification Service (Boundary)", { x: 1.85, y: 1.18, w: 6.3, h: 0.25, fontSize: 9, color: PRIMARY, fontFace: "Calibri", italic: true, bold: true });

// API container
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.1, y: 1.5, w: 2.5, h: 1.6, fill: { color: PRIMARY }, rectRadius: 0.1, shadow: makeShadow() });
s6.addText("[Container]", { x: 2.1, y: 1.55, w: 2.5, h: 0.22, fontSize: 8, color: ACCENT, fontFace: "Calibri", align: "center", italic: true });
s6.addText("API Container", { x: 2.1, y: 1.78, w: 2.5, h: 0.45, fontSize: 13, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s6.addText("ASP.NET Core\n+ Background Services", { x: 2.1, y: 2.25, w: 2.5, h: 0.6, fontSize: 9, color: LGRAY, fontFace: "Calibri", align: "center" });

// Background services box inside boundary
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.1, y: 1.5, w: 2.8, h: 1.6, fill: { color: TEAL }, rectRadius: 0.1, shadow: makeShadow() });
s6.addText("[Background Services]", { x: 5.1, y: 1.55, w: 2.8, h: 0.22, fontSize: 8, color: ACCENT, fontFace: "Calibri", align: "center", italic: true });
s6.addText("Workers", { x: 5.1, y: 1.78, w: 2.8, h: 0.45, fontSize: 13, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s6.addText("RabbitMqConsumer\nOutboxWorker\nRankingJob", { x: 5.1, y: 2.25, w: 2.8, h: 0.62, fontSize: 9, color: LGRAY, fontFace: "Calibri", align: "center" });

// Arrow between API and Workers
s6.addShape(pres.shapes.LINE, { x: 4.6, y: 2.3, w: 0.5, h: 0, line: { color: WHITE, width: 1.5 } });

// PostgreSQL
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.1, y: 3.5, w: 2.5, h: 1.1, fill: { color: "336791" }, rectRadius: 0.1, shadow: makeShadow() });
s6.addText("PostgreSQL 15", { x: 2.1, y: 3.6, w: 2.5, h: 0.45, fontSize: 12, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s6.addText("[Database Container]", { x: 2.1, y: 4.05, w: 2.5, h: 0.25, fontSize: 8.5, color: LGRAY, fontFace: "Calibri", align: "center", italic: true });
s6.addShape(pres.shapes.LINE, { x: 3.35, y: 3.1, w: 0, h: 0.4, line: { color: "336791", width: 1.5 } });
s6.addText("EF Core / SQL", { x: 3.38, y: 3.2, w: 1.2, h: 0.2, fontSize: 7.5, color: "336791", fontFace: "Calibri" });

// Redis
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.3, y: 3.5, w: 2.4, h: 1.1, fill: { color: "CC0000" }, rectRadius: 0.1, shadow: makeShadow() });
s6.addText("Redis 7", { x: 5.3, y: 3.6, w: 2.4, h: 0.45, fontSize: 12, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s6.addText("[Cache Container]", { x: 5.3, y: 4.05, w: 2.4, h: 0.25, fontSize: 8.5, color: LGRAY, fontFace: "Calibri", align: "center", italic: true });
s6.addShape(pres.shapes.LINE, { x: 6.5, y: 3.1, w: 0, h: 0.4, line: { color: "CC0000", width: 1.5 } });
s6.addText("StackExchange", { x: 6.52, y: 3.2, w: 1.2, h: 0.2, fontSize: 7.5, color: "CC0000", fontFace: "Calibri" });

// RabbitMQ external
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.1, y: 2.2, w: 1.55, h: 1.1, fill: { color: "FF6600" }, rectRadius: 0.1, shadow: makeShadow() });
s6.addText("RabbitMQ", { x: 0.1, y: 2.35, w: 1.55, h: 0.35, fontSize: 10, bold: true, color: WHITE, fontFace: "Calibri", align: "center" });
s6.addText("[External]", { x: 0.1, y: 2.72, w: 1.55, h: 0.22, fontSize: 8, color: LGRAY, fontFace: "Calibri", align: "center", italic: true });
s6.addShape(pres.shapes.LINE, { x: 1.65, y: 2.3, w: 0.45, h: 0, line: { color: "FF6600", width: 1.5 } });
s6.addText("AMQP", { x: 1.67, y: 2.1, w: 0.5, h: 0.2, fontSize: 7.5, color: "FF6600", fontFace: "Calibri" });

// Users
s6.addShape(pres.shapes.OVAL, { x: 8.45, y: 2.05, w: 1.3, h: 0.8, fill: { color: "028090" }, shadow: makeShadow() });
s6.addText("Usuarios\n(Actores)", { x: 8.45, y: 2.05, w: 1.3, h: 0.8, fontSize: 9, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
s6.addShape(pres.shapes.LINE, { x: 7.75, y: 2.45, w: 0.7, h: 0, line: { color: "028090", width: 1.5 } });
s6.addText("REST", { x: 7.78, y: 2.22, w: 0.65, h: 0.2, fontSize: 7.5, color: "028090", fontFace: "Calibri", align: "center" });
s6.addNotes("El diagrama muestra los 4 contenedores interactuando. Los Workers y la API comparten la misma base de código pero tienen roles distintos.");

// Slide 7: Resumen
let s7 = pres.addSlide();
s7.background = { color: DARK };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: PRIMARY } });
s7.addText("Resumen — Contenedores C4", { x: 0.5, y: 0.15, w: 9, h: 0.65, fontSize: 22, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
const summaryItems = [
  { icon: "API", color: PRIMARY, text: "API Container: ASP.NET Core expone REST endpoints + Background Services (RabbitMqConsumer, OutboxWorker, RankingJob)" },
  { icon: "DB", color: "336791", text: "PostgreSQL 15: 12 tablas, fuente de verdad, implementa Outbox Pattern e Idempotencia" },
  { icon: "⚡", color: "CC0000", text: "Redis 7: Cache de rankings con TTL 10min. Reduce carga a la base de datos en lecturas frecuentes" },
  { icon: "MQ", color: "FF6600", text: "RabbitMQ 3.12: Broker que desacopla eventos entrantes (LessonCompleted) y salientes (dominio)" },
];
summaryItems.forEach((s, i) => {
  s7.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.2 + i * 0.95, w: 9.2, h: 0.82, fill: { color: s.color }, rectRadius: 0.1, shadow: makeShadow() });
  s7.addText(s.icon, { x: 0.55, y: 1.27 + i * 0.95, w: 0.8, h: 0.7, fontSize: 14, bold: true, color: WHITE, fontFace: "Cambria", align: "center", valign: "middle" });
  s7.addShape(pres.shapes.LINE, { x: 1.35, y: 1.35 + i * 0.95, w: 0, h: 0.55, line: { color: WHITE, width: 1 } });
  s7.addText(s.text, { x: 1.5, y: 1.28 + i * 0.95, w: 7.9, h: 0.65, fontSize: 11.5, color: WHITE, fontFace: "Calibri", valign: "middle" });
});
s7.addText("Gamification Service — Diagrama de Contenedores C4 (Nivel 2)", { x: 0, y: 5.1, w: 10, h: 0.3, fontSize: 9, color: GRAY, fontFace: "Calibri", align: "center" });
s7.addNotes("Cuatro contenedores conforman el Gamification Service. Cada uno tiene responsabilidad clara y usa tecnología específica.");

pres.writeFile({ fileName: "D:/ander/Documents/INTERSEMESTRAL/ECIWISE 2/gamification/presentations/02_C4_Contenedores.pptx" })
  .then(() => console.log("✅ 02_C4_Contenedores.pptx generado"))
  .catch(e => console.error("❌", e));
