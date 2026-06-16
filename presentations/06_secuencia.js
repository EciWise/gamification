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
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: "6D2E46" } });
  slide.addText(title, { x: 0.4, y: 0.18, w: 7.5, h: 0.7, fontSize: 24, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.4, y: 0.72, w: 8, h: 0.35, fontSize: 11, color: "ECBFC8", fontFace: "Calibri", margin: 0 });
  }
}

// Helper: draw a sequence step (horizontal arrow with label)
function seqArrow(slide, pres, fromX, toX, y, label, color, dashed) {
  slide.addShape(pres.shapes.LINE, { x: Math.min(fromX, toX), y, w: Math.abs(toX - fromX), h: 0, line: { color, width: 1.5, dashType: dashed ? "dash" : "solid" } });
  const midX = (fromX + toX) / 2;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: midX - 1.0, y: y - 0.22, w: 2.0, h: 0.2, fill: { color: WHITE }, rectRadius: 0.04 });
  slide.addText(label, { x: midX - 1.0, y: y - 0.23, w: 2.0, h: 0.2, fontSize: 7.5, color, fontFace: "Calibri", align: "center", bold: true });
}

function seqLifeline(slide, pres, x, label, color, y1, y2) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.8, y: y1, w: 1.6, h: 0.45, fill: { color }, rectRadius: 0.08, shadow: makeShadow() });
  slide.addText(label, { x: x - 0.8, y: y1, w: 1.6, h: 0.45, fontSize: 8.5, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
  slide.addShape(pres.shapes.LINE, { x, y: y1 + 0.45, w: 0, h: y2 - y1 - 0.45, line: { color, width: 1, dashType: "dash" } });
}

function actBox(slide, pres, x, y, h, color) {
  slide.addShape(pres.shapes.RECTANGLE, { x: x - 0.12, y, w: 0.24, h, fill: { color }, line: { color: WHITE, width: 0.5 } });
}

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Diagrama de Secuencia";

// Slide 1: Title
let s1 = pres.addSlide();
s1.background = { color: DARK };
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.3, w: 10, h: 1.325, fill: { color: "6D2E46" } });
s1.addText("Diagrama de Secuencia", { x: 0.6, y: 0.85, w: 8.8, h: 1.0, fontSize: 42, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s1.addText("Flujos de interacción entre componentes", { x: 0.6, y: 2.0, w: 8.8, h: 0.6, fontSize: 22, color: ACCENT, fontFace: "Calibri", align: "center" });
s1.addText("Microservicio de Gamificación | EciWise 2", { x: 0.6, y: 2.75, w: 8.8, h: 0.45, fontSize: 16, color: "A8D8EA", fontFace: "Calibri", align: "center" });
s1.addText("4 flujos clave: Assign Points • Get Ranking • Ranking Job • Outbox Worker", { x: 0.6, y: 4.55, w: 8.8, h: 0.4, fontSize: 13, color: ACCENT, fontFace: "Calibri", align: "center" });
s1.addNotes("4 diagramas de secuencia que muestran los flujos más importantes del Gamification Service.");

// Slide 2: Flujo 1 - Assign Points
let s2 = pres.addSlide();
addSlideHeader(s2, pres, "Secuencia 1: Asignación de Puntos", "Evento LessonCompleted → AssignPointsCommand → PostgreSQL");
const lifelineY = 1.15, lifelineEnd = 5.35;
const participants = [
  { x: 0.9, label: "RabbitMQ\nBroker", color: "FF6600" },
  { x: 2.3, label: "RabbitMq\nConsumer", color: "6D2E46" },
  { x: 3.7, label: "IMediator\n(MediatR)", color: PRIMARY },
  { x: 5.1, label: "Assign\nHandler", color: "21295C" },
  { x: 6.5, label: "UserGamif.\n(Domain)", color: TEAL },
  { x: 7.9, label: "Repository\n(EF Core)", color: "336791" },
  { x: 9.3, label: "PostgreSQL", color: "336791" },
];
participants.forEach(p => seqLifeline(s2, pres, p.x, p.label, p.color, lifelineY, lifelineEnd));

// Steps
const steps2 = [
  { from: 0, to: 1, y: 1.75, label: "LessonCompleted event", color: "FF6600" },
  { from: 1, to: 1, y: 2.0, label: "Check processed_events (idempotency)", color: "6D2E46", self: true },
  { from: 1, to: 2, y: 2.2, label: "Send(AssignPointsCommand)", color: PRIMARY },
  { from: 2, to: 3, y: 2.45, label: "Handle(command)", color: "21295C" },
  { from: 3, to: 5, y: 2.7, label: "GetByUserIdAsync(userId)", color: "336791" },
  { from: 5, to: 6, y: 2.95, label: "SELECT user_gamification", color: "336791" },
  { from: 6, to: 5, y: 3.2, label: "UserGamification entity", color: "336791", ret: true },
  { from: 3, to: 4, y: 3.45, label: "AddPoints(transaction)", color: TEAL },
  { from: 4, to: 4, y: 3.7, label: "Raise PointsAddedEvent → outbox", color: TEAL, self: true },
  { from: 3, to: 5, y: 3.95, label: "SaveAsync(userGamification)", color: "336791" },
  { from: 5, to: 6, y: 4.2, label: "INSERT point_transaction + outbox", color: "336791" },
  { from: 6, to: 5, y: 4.45, label: ":ok", color: GRAY, ret: true },
  { from: 1, to: 0, y: 4.7, label: "BasicAck (message consumed)", color: "FF6600", ret: true },
];
const xs2 = participants.map(p => p.x);
steps2.forEach(st => {
  if (st.self) {
    s2.addShape(pres.shapes.LINE, { x: xs2[st.from], y: st.y, w: 0.35, h: 0, line: { color: st.color, width: 1.2 } });
    s2.addShape(pres.shapes.LINE, { x: xs2[st.from] + 0.35, y: st.y, w: 0, h: 0.15, line: { color: st.color, width: 1.2 } });
    s2.addShape(pres.shapes.LINE, { x: xs2[st.from], y: st.y + 0.15, w: 0.35, h: 0, line: { color: st.color, width: 1.2 } });
    s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: xs2[st.from] + 0.35, y: st.y - 0.12, w: 1.6, h: 0.18, fill: { color: LIGHT }, rectRadius: 0.04 });
    s2.addText(st.label, { x: xs2[st.from] + 0.36, y: st.y - 0.13, w: 1.58, h: 0.18, fontSize: 7, color: st.color, fontFace: "Calibri" });
  } else {
    seqArrow(s2, pres, xs2[st.from], xs2[st.to], st.y, st.label, st.color, st.ret);
  }
});
s2.addNotes("El flujo de asignación de puntos es el más importante. Combina idempotencia, CQRS, DDD y Outbox Pattern en un único flujo transaccional.");

// Slide 3: Flujo 2 - Get Ranking
let s3 = pres.addSlide();
addSlideHeader(s3, pres, "Secuencia 2: Consulta de Ranking", "GET /api/gamification/users/{userId}/ranking → Cache → DB");
const p3 = [
  { x: 1.0, label: "Cliente\n(Browser/App)", color: "028090" },
  { x: 2.5, label: "Gamif.\nController", color: "21295C" },
  { x: 3.9, label: "IMediator", color: PRIMARY },
  { x: 5.3, label: "Ranking\nHandler", color: "6D2E46" },
  { x: 6.7, label: "Redis\nCache", color: "CC0000" },
  { x: 8.1, label: "Ranking\nRepository", color: "336791" },
  { x: 9.5, label: "PostgreSQL", color: "336791" },
];
p3.forEach(p => seqLifeline(s3, pres, p.x, p.label, p.color, lifelineY, lifelineEnd));
const xs3 = p3.map(p => p.x);

const steps3 = [
  { from: 0, to: 1, y: 1.75, label: "GET /api/.../ranking?type=...", color: "028090" },
  { from: 1, to: 2, y: 2.0, label: "Send(GetUserRankingQuery)", color: PRIMARY },
  { from: 2, to: 3, y: 2.25, label: "Handle(query)", color: "6D2E46" },
  { from: 3, to: 4, y: 2.5, label: "GetTopRankingsAsync(type)", color: "CC0000" },
  { from: 4, to: 3, y: 2.75, label: "null (cache miss)", color: "CC0000", ret: true },
  { from: 3, to: 5, y: 3.0, label: "GetCurrentAsync(type, subjectCode)", color: "336791" },
  { from: 5, to: 6, y: 3.25, label: "SELECT rankings + ranking_entries", color: "336791" },
  { from: 6, to: 5, y: 3.5, label: "Ranking aggregate", color: "336791", ret: true },
  { from: 3, to: 4, y: 3.75, label: "SetTopRankingsAsync (refresh cache)", color: "CC0000" },
  { from: 3, to: 2, y: 4.0, label: "ranking.GetUserPosition(userId)", color: "6D2E46", ret: true },
  { from: 2, to: 1, y: 4.25, label: "UserRankingDto {position, score}", color: PRIMARY, ret: true },
  { from: 1, to: 0, y: 4.5, label: "200 OK { userId, position, score }", color: "028090", ret: true },
];
steps3.forEach(st => {
  seqArrow(s3, pres, xs3[st.from], xs3[st.to], st.y, st.label, st.color, st.ret);
});
// Alt box note
s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.65, y: 2.62, w: 3.2, h: 1.25, fill: { color: "FFF9C4" }, rectRadius: 0.06 });
s3.addText("alt [cache miss]", { x: 3.7, y: 2.63, w: 3.1, h: 0.2, fontSize: 7.5, bold: true, color: "827717", fontFace: "Calibri" });
s3.addText("[cache hit]: retorna directo sin ir a DB", { x: 3.7, y: 4.85, w: 5.5, h: 0.2, fontSize: 8, color: GRAY, fontFace: "Calibri", italic: true });
s3.addNotes("El flujo de consulta usa Cache-Aside: primero Redis, si miss va a PostgreSQL y actualiza el cache. El ranking fue pre-calculado por el RankingJob.");

// Slide 4: Flujo 3 - Ranking Job
let s4 = pres.addSlide();
addSlideHeader(s4, pres, "Secuencia 3: RankingJob (Background Service)", "Cálculo periódico de rankings — cada 24 horas");
const p4 = [
  { x: 1.2, label: "RankingJob\n(BG Service)", color: TEAL },
  { x: 2.8, label: "AppDb\nContext", color: "336791" },
  { x: 4.3, label: "PostgreSQL", color: "336791" },
  { x: 5.8, label: "Ranking\n(Aggregate)", color: "21295C" },
  { x: 7.3, label: "Ranking\nRepository", color: "336791" },
  { x: 8.8, label: "Redis\nCache", color: "CC0000" },
];
p4.forEach(p => seqLifeline(s4, pres, p.x, p.label, p.color, lifelineY, lifelineEnd));
const xs4 = p4.map(p => p.x);

const steps4 = [
  { from: 0, to: 0, y: 1.75, label: "ExecuteAsync() — cada 24h Timer", color: TEAL, self: true },
  { from: 0, to: 1, y: 2.1, label: "Query Top 100 users by TotalPoints", color: "336791" },
  { from: 1, to: 2, y: 2.35, label: "SELECT top 100 user_gamification ORDER BY points DESC", color: "336791" },
  { from: 2, to: 1, y: 2.6, label: "List<UserRankingData>", color: "336791", ret: true },
  { from: 0, to: 3, y: 2.85, label: "new Ranking(GlobalPorPuntos, period)", color: "21295C" },
  { from: 0, to: 3, y: 3.1, label: "ranking.Recalculate(userData)", color: "21295C" },
  { from: 3, to: 3, y: 3.35, label: "Crea RankingEntry para cada usuario con posición y score", color: "21295C", self: true },
  { from: 0, to: 4, y: 3.7, label: "SaveAsync(ranking)", color: "336791" },
  { from: 4, to: 2, y: 3.95, label: "UPSERT rankings + ranking_entries", color: "336791" },
  { from: 2, to: 4, y: 4.2, label: ":ok", color: GRAY, ret: true },
  { from: 0, to: 5, y: 4.45, label: "InvalidateRankingAsync(GlobalPorPuntos)", color: "CC0000" },
  { from: 5, to: 0, y: 4.7, label: ":invalidated (próxima lectura irá a DB)", color: "CC0000", ret: true },
];
steps4.forEach(st => {
  if (st.self) {
    s4.addShape(pres.shapes.LINE, { x: xs4[st.from], y: st.y, w: 0.35, h: 0, line: { color: st.color, width: 1.2 } });
    s4.addShape(pres.shapes.LINE, { x: xs4[st.from] + 0.35, y: st.y, w: 0, h: 0.15, line: { color: st.color, width: 1.2 } });
    s4.addShape(pres.shapes.LINE, { x: xs4[st.from], y: st.y + 0.15, w: 0.35, h: 0, line: { color: st.color, width: 1.2 } });
    s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: xs4[st.from] + 0.35, y: st.y - 0.12, w: 3.0, h: 0.18, fill: { color: LIGHT }, rectRadius: 0.04 });
    s4.addText(st.label, { x: xs4[st.from] + 0.36, y: st.y - 0.13, w: 2.98, h: 0.18, fontSize: 7, color: st.color, fontFace: "Calibri" });
  } else {
    seqArrow(s4, pres, xs4[st.from], xs4[st.to], st.y, st.label, st.color, st.ret);
  }
});
s4.addNotes("El RankingJob corre en background cada 24 horas. Calcula el Top 100, lo persiste en PostgreSQL e invalida el cache de Redis.");

// Slide 5: Flujo 4 - Outbox Worker
let s5 = pres.addSlide();
addSlideHeader(s5, pres, "Secuencia 4: OutboxWorker — Publicación de Eventos", "Garantía de entrega de eventos de dominio via Outbox Pattern");
const p5 = [
  { x: 1.0, label: "Outbox\nWorker", color: "6D2E46" },
  { x: 2.5, label: "AppDb\nContext", color: "336791" },
  { x: 4.0, label: "PostgreSQL\n(outbox table)", color: "336791" },
  { x: 5.7, label: "RabbitMq\nProducer", color: "FF6600" },
  { x: 7.2, label: "RabbitMQ\nBroker", color: "FF6600" },
  { x: 8.7, label: "Other\nServices", color: "028090" },
];
p5.forEach(p => seqLifeline(s5, pres, p.x, p.label, p.color, lifelineY, lifelineEnd));
const xs5 = p5.map(p => p.x);

const steps5 = [
  { from: 0, to: 0, y: 1.75, label: "ExecuteAsync() — cada 5 segundos", color: "6D2E46", self: true },
  { from: 0, to: 1, y: 2.1, label: "Query pending events (ProcessedAt IS NULL, RetryCount < 5)", color: "336791" },
  { from: 1, to: 2, y: 2.35, label: "SELECT * FROM outbox WHERE processedAt IS NULL LIMIT 20", color: "336791" },
  { from: 2, to: 1, y: 2.6, label: "List<OutboxEvent>", color: "336791", ret: true },
  { from: 0, to: 3, y: 2.85, label: "PublishAsync(exchange, routingKey, event)", color: "FF6600" },
  { from: 3, to: 4, y: 3.1, label: "BasicPublish (AMQP)", color: "FF6600" },
  { from: 4, to: 5, y: 3.35, label: "Deliver event (PointsAdded / AchievementUnlocked / LevelUp)", color: "028090" },
  { from: 0, to: 1, y: 3.7, label: "Mark processedAt = DateTime.UtcNow", color: "336791" },
  { from: 1, to: 2, y: 3.95, label: "UPDATE outbox SET processedAt = now()", color: "336791" },
  { from: 2, to: 1, y: 4.2, label: ":ok", color: GRAY, ret: true },
];

// On failure sub-note
steps5.forEach(st => {
  if (st.self) {
    s5.addShape(pres.shapes.LINE, { x: xs5[st.from], y: st.y, w: 0.35, h: 0, line: { color: st.color, width: 1.2 } });
    s5.addShape(pres.shapes.LINE, { x: xs5[st.from] + 0.35, y: st.y, w: 0, h: 0.15, line: { color: st.color, width: 1.2 } });
    s5.addShape(pres.shapes.LINE, { x: xs5[st.from], y: st.y + 0.15, w: 0.35, h: 0, line: { color: st.color, width: 1.2 } });
    s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: xs5[st.from] + 0.35, y: st.y - 0.12, w: 2.8, h: 0.18, fill: { color: LIGHT }, rectRadius: 0.04 });
    s5.addText(st.label, { x: xs5[st.from] + 0.36, y: st.y - 0.13, w: 2.78, h: 0.18, fontSize: 7, color: st.color, fontFace: "Calibri" });
  } else {
    seqArrow(s5, pres, xs5[st.from], xs5[st.to], st.y, st.label, st.color, st.ret);
  }
});
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.25, y: 4.5, w: 9.5, h: 0.75, fill: { color: LIGHT }, rectRadius: 0.08 });
s5.addText("En caso de falla al publicar:", { x: 0.4, y: 4.52, w: 2.5, h: 0.25, fontSize: 10, bold: true, color: "6D2E46", fontFace: "Calibri" });
s5.addText("RetryCount++ → Si RetryCount < 5: el evento se reintentará en el próximo ciclo (5 segundos). Si RetryCount >= 5: el evento queda en outbox sin publicar (dead-letter manual).", {
  x: 0.4, y: 4.78, w: 9.3, h: 0.42, fontSize: 9.5, color: "334155", fontFace: "Calibri"
});
s5.addNotes("OutboxWorker garantiza at-least-once delivery. Si RabbitMQ no está disponible, los eventos se reintentan hasta 5 veces.");

// Slide 6: Idempotencia
let s6 = pres.addSlide();
addSlideHeader(s6, pres, "Mecanismo de Idempotencia", "Exactly-Once Processing con IdempotencyKey y ProcessedEvents");
// Two columns
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.2, w: 4.55, h: 4.1, fill: { color: WHITE }, rectRadius: 0.12, shadow: makeShadow() });
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.2, w: 4.55, h: 0.42, fill: { color: "6D2E46" }, rectRadius: 0.12 });
s6.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.52, w: 4.55, h: 0.1, fill: { color: "6D2E46" } });
s6.addText("¿Por qué Idempotencia?", { x: 0.45, y: 1.25, w: 4.25, h: 0.3, fontSize: 13, bold: true, color: WHITE, fontFace: "Calibri" });
s6.addText([
  { text: "RabbitMQ garantiza at-least-once delivery: un mensaje puede llegar más de una vez si:", options: { breakLine: true, fontSize: 10, color: "334155", fontFace: "Calibri" } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "• La conexión se interrumpe antes del BasicAck", options: { bullet: false, breakLine: true, fontSize: 10, color: "334155", fontFace: "Calibri" } },
  { text: "• El consumer cae después de procesar pero antes de confirmar", options: { bullet: false, breakLine: true, fontSize: 10, color: "334155", fontFace: "Calibri" } },
  { text: "• Un retry automático del broker", options: { bullet: false, breakLine: true, fontSize: 10, color: "334155", fontFace: "Calibri" } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "Sin idempotencia: un usuario podría recibir puntos duplicados.", options: { breakLine: true, fontSize: 10, color: "6D2E46", fontFace: "Calibri", bold: true } },
], { x: 0.45, y: 1.72, w: 4.25, h: 2.6 });

s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 4.25, w: 4.35, h: 0.95, fill: { color: LIGHT }, rectRadius: 0.08 });
s6.addText("IdempotencyKey = sourceEventId + \"-\" + actionType", { x: 0.5, y: 4.3, w: 4.15, h: 0.3, fontSize: 10, bold: true, color: "6D2E46", fontFace: "Calibri", align: "center" });
s6.addText("Ej: '3f2a-...-sourceId-TutoriaCompletada' — único por evento y acción", { x: 0.5, y: 4.62, w: 4.15, h: 0.5, fontSize: 9, color: GRAY, fontFace: "Calibri", align: "center" });

// Right column: flow
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.15, y: 1.2, w: 4.55, h: 4.1, fill: { color: WHITE }, rectRadius: 0.12, shadow: makeShadow() });
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.15, y: 1.2, w: 4.55, h: 0.42, fill: { color: PRIMARY }, rectRadius: 0.12 });
s6.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 1.52, w: 4.55, h: 0.1, fill: { color: PRIMARY } });
s6.addText("Flujo de Verificación", { x: 5.3, y: 1.25, w: 4.25, h: 0.3, fontSize: 13, bold: true, color: WHITE, fontFace: "Calibri" });
const idemSteps = [
  { n: "1", t: "Mensaje recibido de RabbitMQ", c: "FF6600" },
  { n: "2", t: "Calcular IdempotencyKey = eventId + actionType", c: "6D2E46" },
  { n: "3", t: "Buscar en tabla processed_events WHERE eventId = key", c: "336791" },
  { n: "4a", t: "EXISTE → BasicAck (duplicado ignorado, ya procesado)", c: "CC0000" },
  { n: "4b", t: "NO EXISTE → Procesar AssignPointsCommand normalmente", c: TEAL },
  { n: "5", t: "INSERT INTO processed_events (idempotencyKey)", c: PRIMARY },
  { n: "6", t: "BasicAck (mensaje confirmado y eliminado de la cola)", c: "FF6600" },
];
idemSteps.forEach((st, i) => {
  const y = 1.72 + i * 0.48;
  const col = st.n === "4a" ? "FFF0F0" : (st.n === "4b" ? "F0FFF4" : LIGHT);
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.3, y, w: 4.25, h: 0.42, fill: { color: col }, rectRadius: 0.06 });
  s6.addShape(pres.shapes.OVAL, { x: 5.32, y: y + 0.06, w: 0.3, h: 0.3, fill: { color: st.c } });
  s6.addText(st.n, { x: 5.32, y: y + 0.06, w: 0.3, h: 0.3, fontSize: 8, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
  s6.addText(st.t, { x: 5.68, y: y + 0.08, w: 3.8, h: 0.28, fontSize: 8.5, color: "1E293B", fontFace: "Calibri" });
});
s6.addNotes("La idempotencia es crítica en sistemas de mensajería. El IdempotencyKey es determinístico: el mismo evento siempre genera la misma clave.");

// Slide 7: Resumen
let s7 = pres.addSlide();
s7.background = { color: DARK };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: "6D2E46" } });
s7.addText("Resumen — Diagramas de Secuencia", { x: 0.5, y: 0.15, w: 9, h: 0.65, fontSize: 22, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
const sumS = [
  { t: "Flujo 1: Assign Points", c: "6D2E46", d: "RabbitMQ → Check Idempotencia → MediatR → Domain (AddPoints) → PostgreSQL (transaction + outbox) → BasicAck" },
  { t: "Flujo 2: Get Ranking", c: PRIMARY, d: "HTTP GET → Controller → MediatR → Handler → Redis (cache) → PostgreSQL (si miss) → actualizar cache → 200 OK" },
  { t: "Flujo 3: Ranking Job", c: TEAL, d: "Timer 24h → Query Top 100 usuarios → Recalculate(ranking) → SaveAsync → InvalidateRankingAsync(Redis)" },
  { t: "Flujo 4: Outbox Worker", c: "FF6600", d: "Timer 5s → Query outbox pendientes → PublishAsync(RabbitMQ) → Mark processedAt → RetryCount si falla" },
];
sumS.forEach((s, i) => {
  s7.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.15 + i * 0.95, w: 9.4, h: 0.82, fill: { color: s.c }, rectRadius: 0.1, shadow: makeShadow() });
  s7.addText(s.t, { x: 0.45, y: 1.22 + i * 0.95, w: 2.4, h: 0.65, fontSize: 11, bold: true, color: WHITE, fontFace: "Cambria", valign: "middle" });
  s7.addShape(pres.shapes.LINE, { x: 2.85, y: 1.3 + i * 0.95, w: 0, h: 0.5, line: { color: WHITE, width: 1 } });
  s7.addText(s.d, { x: 3.0, y: 1.23 + i * 0.95, w: 6.65, h: 0.65, fontSize: 10.5, color: WHITE, fontFace: "Calibri", valign: "middle" });
});
s7.addText("Gamification Service — Diagramas de Secuencia de los 4 flujos principales", { x: 0, y: 5.1, w: 10, h: 0.3, fontSize: 9, color: GRAY, fontFace: "Calibri", align: "center" });
s7.addNotes("Los 4 flujos cubren los casos de uso principales. El patrón Outbox + Idempotencia garantiza consistencia en un sistema distribuido.");

pres.writeFile({ fileName: "D:/ander/Documents/INTERSEMESTRAL/ECIWISE 2/gamification/presentations/06_Secuencia.pptx" })
  .then(() => console.log("✅ 06_Secuencia.pptx generado"))
  .catch(e => console.error("❌", e));
