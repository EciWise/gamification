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

function addCard(slide, pres, x, y, w, h, headerText, headerColor, bodyLines) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow() });
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.38, fill: { color: headerColor }, rectRadius: 0.1 });
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.28, w, h: 0.1, fill: { color: headerColor } });
  slide.addText(headerText, { x: x + 0.1, y: y + 0.05, w: w - 0.2, h: 0.28, fontSize: 11, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  if (bodyLines && bodyLines.length > 0) {
    const items = bodyLines.map((l, i) => ({ text: l, options: { bullet: true, breakLine: i < bodyLines.length - 1, fontSize: 10, color: "1E293B", fontFace: "Calibri" } }));
    slide.addText(items, { x: x + 0.12, y: y + 0.42, w: w - 0.24, h: h - 0.5, valign: "top" });
  }
}

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "C4 - Diagrama de Contexto";

// Slide 1: Title
let s1 = pres.addSlide();
s1.background = { color: DARK };
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.3, w: 10, h: 1.325, fill: { color: PRIMARY } });
s1.addText("Diagrama de Contexto", { x: 0.6, y: 1.0, w: 8.8, h: 1.0, fontSize: 42, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s1.addText("Modelo C4 — Nivel 1", { x: 0.6, y: 2.1, w: 8.8, h: 0.6, fontSize: 22, color: ACCENT, fontFace: "Calibri", align: "center" });
s1.addText("Microservicio de Gamificación | EciWise 2", { x: 0.6, y: 2.8, w: 8.8, h: 0.45, fontSize: 16, color: "A8D8EA", fontFace: "Calibri", align: "center" });
s1.addText("Arquitectura de Software • 2026", { x: 0.6, y: 4.55, w: 8.8, h: 0.4, fontSize: 13, color: LGRAY, fontFace: "Calibri", align: "center" });
s1.addNotes("Slide de título. El diagrama de Contexto C4 (Nivel 1) muestra el sistema en su entorno: quiénes interactúan con él y qué sistemas externos usa.");

// Slide 2: ¿Qué es el Diagrama de Contexto?
let s2 = pres.addSlide();
addSlideHeader(s2, pres, "¿Qué es el Diagrama de Contexto C4?", "Nivel 1 del modelo C4 — La vista más amplia del sistema");
s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.25, w: 9.2, h: 0.75, fill: { color: LIGHT }, rectRadius: 0.08 });
s2.addText("El Diagrama de Contexto sitúa el sistema dentro de su entorno. Responde: ¿Quiénes usan el sistema? ¿Con qué otros sistemas interactúa?", {
  x: 0.55, y: 1.3, w: 9.0, h: 0.65, fontSize: 13, color: PRIMARY, fontFace: "Calibri", italic: true
});
const pillars = [
  { title: "Sistema Central", body: "Gamification Service\n(Microservicio .NET 10)", color: PRIMARY },
  { title: "Usuarios / Actores", body: "Estudiantes, Tutores\ny Administradores", color: TEAL },
  { title: "Sistemas Externos", body: "RabbitMQ, PostgreSQL\nRedis, Servicios ECI", color: "028090" },
];
pillars.forEach((p, i) => {
  const x = 0.4 + i * 3.1;
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.2, w: 2.9, h: 2.7, fill: { color: p.color }, rectRadius: 0.12, shadow: makeShadow() });
  s2.addText(p.title, { x: x + 0.1, y: 2.3, w: 2.7, h: 0.4, fontSize: 13, bold: true, color: WHITE, fontFace: "Calibri", align: "center" });
  s2.addShape(pres.shapes.LINE, { x: x + 0.25, y: 2.75, w: 2.4, h: 0, line: { color: WHITE, width: 1 } });
  s2.addText(p.body, { x: x + 0.1, y: 2.8, w: 2.7, h: 1.8, fontSize: 12, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
});
s2.addNotes("El contexto C4 es la vista de más alto nivel. Identifica actores externos e integraciones sin entrar en detalles internos.");

// Slide 3: El Sistema Central
let s3 = pres.addSlide();
addSlideHeader(s3, pres, "El Sistema Central", "Gamification Service — Microservicio de Gamificación");
// Central box
s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.0, y: 1.4, w: 4.0, h: 2.8, fill: { color: PRIMARY }, rectRadius: 0.15, shadow: makeShadow() });
s3.addText("[Software System]", { x: 3.0, y: 1.5, w: 4.0, h: 0.3, fontSize: 10, color: ACCENT, fontFace: "Calibri", align: "center", italic: true });
s3.addText("Gamification\nService", { x: 3.0, y: 1.85, w: 4.0, h: 0.8, fontSize: 20, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s3.addShape(pres.shapes.LINE, { x: 3.3, y: 2.75, w: 3.4, h: 0, line: { color: WHITE, width: 1 } });
s3.addText("Gestiona puntos, logros y rankings\npara la plataforma EciWise 2.\nDesarrollado en .NET 10 / C#\nArquitectura Hexagonal", {
  x: 3.1, y: 2.85, w: 3.8, h: 1.2, fontSize: 10, color: LGRAY, fontFace: "Calibri", align: "center"
});
// Responsibilities
s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.2, y: 1.5, w: 2.5, h: 3.5, fill: { color: LIGHT }, rectRadius: 0.1, shadow: makeShadow() });
s3.addText("Responsabilidades", { x: 0.3, y: 1.6, w: 2.3, h: 0.3, fontSize: 11, bold: true, color: PRIMARY, fontFace: "Calibri" });
const resps = ["Asignar puntos por acciones", "Desbloquear logros (achievements)", "Calcular rankings globales y por materia", "Publicar eventos de dominio", "Cache de rankings en Redis"];
resps.forEach((r, i) => {
  s3.addShape(pres.shapes.OVAL, { x: 0.32, y: 2.0 + i * 0.55, w: 0.18, h: 0.18, fill: { color: ACCENT } });
  s3.addText(r, { x: 0.56, y: 1.97 + i * 0.55, w: 2.0, h: 0.25, fontSize: 9.5, color: "1E293B", fontFace: "Calibri" });
});
// Tech stack
s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.3, y: 1.5, w: 2.5, h: 3.5, fill: { color: LIGHT }, rectRadius: 0.1, shadow: makeShadow() });
s3.addText("Stack Tecnológico", { x: 7.4, y: 1.6, w: 2.3, h: 0.3, fontSize: 11, bold: true, color: PRIMARY, fontFace: "Calibri" });
const stack = [".NET 10 / C#", "ASP.NET Core", "Entity Framework Core", "MediatR (CQRS)", "xUnit + Moq"];
stack.forEach((r, i) => {
  s3.addShape(pres.shapes.OVAL, { x: 7.42, y: 2.0 + i * 0.55, w: 0.18, h: 0.18, fill: { color: PRIMARY } });
  s3.addText(r, { x: 7.66, y: 1.97 + i * 0.55, w: 2.0, h: 0.25, fontSize: 9.5, color: "1E293B", fontFace: "Calibri" });
});
s3.addNotes("El Gamification Service es el núcleo. Gestiona toda la lógica de gamificación: puntos, logros y rankings.");

// Slide 4: Actores del Sistema
let s4 = pres.addSlide();
addSlideHeader(s4, pres, "Actores del Sistema", "¿Quiénes interactúan con el Microservicio de Gamificación?");
const actors = [
  { name: "Estudiante", role: "Persona", desc: "Completa tutorías, gana puntos, desbloquea logros y consulta su posición en el ranking.", color: "028090", actions: ["Ver ranking personal", "Consultar logros", "Recibir puntos automáticamente"] },
  { name: "Tutor", role: "Persona", desc: "Dicta tutorías y recibe puntos por calificaciones. Puede alcanzar el logro Mentor del Mes.", color: TEAL, actions: ["Ganar puntos por tutorías", "Desbloquear logros especiales", "Aparecer en Top Tutores"] },
  { name: "Administrador", role: "Persona", desc: "Consulta reglas de gamificación activas y gestiona la configuración del sistema.", color: PRIMARY, actions: ["Consultar /api/admin/rules", "Gestionar reglas activas", "Monitorear el sistema"] },
];
actors.forEach((a, i) => {
  const x = 0.35 + i * 3.15;
  // Person icon (circle + rectangle)
  s4.addShape(pres.shapes.OVAL, { x: x + 0.95, y: 1.2, w: 1.0, h: 1.0, fill: { color: a.color }, shadow: makeShadow() });
  s4.addText(a.name[0], { x: x + 0.95, y: 1.2, w: 1.0, h: 1.0, fontSize: 28, bold: true, color: WHITE, fontFace: "Cambria", align: "center", valign: "middle" });
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.35, w: 2.9, h: 2.9, fill: { color: LIGHT }, rectRadius: 0.1, shadow: makeShadow() });
  s4.addText(a.name, { x: x + 0.1, y: 2.42, w: 2.7, h: 0.35, fontSize: 14, bold: true, color: a.color, fontFace: "Calibri", align: "center" });
  s4.addText(`[${a.role}]`, { x: x + 0.1, y: 2.75, w: 2.7, h: 0.22, fontSize: 9, color: GRAY, fontFace: "Calibri", align: "center", italic: true });
  s4.addText(a.desc, { x: x + 0.12, y: 3.03, w: 2.66, h: 0.75, fontSize: 9.5, color: "334155", fontFace: "Calibri" });
  const items = a.actions.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < a.actions.length - 1, fontSize: 9, color: "1E293B", fontFace: "Calibri" } }));
  s4.addText(items, { x: x + 0.12, y: 3.82, w: 2.66, h: 1.2, valign: "top" });
});
s4.addNotes("Tres tipos de actores interactúan con el sistema. Los roles de Estudiante y Tutor son los principales generadores de eventos.");

// Slide 5: Sistemas Externos
let s5 = pres.addSlide();
addSlideHeader(s5, pres, "Sistemas Externos", "Dependencias e integraciones del Microservicio de Gamificación");
const ext = [
  { name: "PostgreSQL 15", type: "Base de Datos", desc: "Almacena: usuarios, puntos, logros, rankings, reglas, outbox de eventos y eventos procesados.", color: "336791", rel: "Lee y escribe datos (EF Core + Npgsql)" },
  { name: "Redis 7", type: "Cache Distribuido", desc: "Cachea los top rankings con TTL de 10 minutos. Reduce carga a PostgreSQL en consultas frecuentes.", color: "CC0000", rel: "Lectura/escritura de rankings cacheados" },
  { name: "RabbitMQ 3.12", type: "Message Broker", desc: "Recibe eventos externos (LessonCompleted) y publica eventos de dominio (PointsAdded, LevelUp, etc.).", color: "FF6600", rel: "Consume y publica mensajes asincrónicos" },
  { name: "Otros Servicios ECI", type: "Microservicio", desc: "Servicios de la plataforma EciWise que publican eventos de actividad de usuarios hacia el broker.", color: "6D2E46", rel: "Produce eventos al broker RabbitMQ" },
];
ext.forEach((e, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.35 + col * 4.85, y = 1.25 + row * 2.1;
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.55, h: 1.95, fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow() });
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 0.55, h: 1.95, fill: { color: e.color }, rectRadius: 0.1 });
  s5.addShape(pres.shapes.RECTANGLE, { x: x + 0.45, y, w: 0.1, h: 1.95, fill: { color: e.color } });
  s5.addText(e.name[0], { x, y, w: 0.55, h: 1.95, fontSize: 18, bold: true, color: WHITE, fontFace: "Cambria", align: "center", valign: "middle" });
  s5.addText(e.name, { x: x + 0.65, y: y + 0.1, w: 3.75, h: 0.3, fontSize: 13, bold: true, color: "1E293B", fontFace: "Calibri" });
  s5.addText(`[${e.type}]`, { x: x + 0.65, y: y + 0.38, w: 3.75, h: 0.22, fontSize: 9, color: GRAY, fontFace: "Calibri", italic: true });
  s5.addText(e.desc, { x: x + 0.65, y: y + 0.6, w: 3.8, h: 0.75, fontSize: 9.5, color: "334155", fontFace: "Calibri" });
  s5.addText(`→ ${e.rel}`, { x: x + 0.65, y: y + 1.6, w: 3.8, h: 0.25, fontSize: 9, color: e.color, fontFace: "Calibri", bold: true });
});
s5.addNotes("Cuatro sistemas externos clave. PostgreSQL es la fuente de verdad; Redis optimiza las lecturas; RabbitMQ desacopla los servicios.");

// Slide 6: Diagrama de Contexto Visual
let s6 = pres.addSlide();
addSlideHeader(s6, pres, "Diagrama de Contexto — Vista General", "Relaciones entre actores, sistema y dependencias externas");
// Central system
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.6, y: 1.9, w: 2.8, h: 1.7, fill: { color: PRIMARY }, rectRadius: 0.12, shadow: makeShadow() });
s6.addText("Gamification\nService", { x: 3.6, y: 2.1, w: 2.8, h: 0.8, fontSize: 14, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s6.addText(".NET 10 | Hexagonal", { x: 3.6, y: 3.0, w: 2.8, h: 0.35, fontSize: 9, color: ACCENT, fontFace: "Calibri", align: "center" });

// Actors left
const actorData = [{ label: "Estudiante", y: 1.5 }, { label: "Tutor", y: 2.6 }, { label: "Admin", y: 3.7 }];
actorData.forEach(a => {
  s6.addShape(pres.shapes.OVAL, { x: 0.3, y: a.y, w: 1.1, h: 0.7, fill: { color: "028090" }, shadow: makeShadow() });
  s6.addText(a.label, { x: 0.3, y: a.y, w: 1.1, h: 0.7, fontSize: 10, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
  s6.addShape(pres.shapes.LINE, { x: 1.4, y: a.y + 0.35, w: 2.2, h: 0, line: { color: TEAL, width: 1.5 } });
  s6.addText("HTTP / REST", { x: 1.45, y: a.y + 0.1, w: 2.1, h: 0.22, fontSize: 7.5, color: TEAL, fontFace: "Calibri", align: "center" });
});

// External systems right
const extData = [
  { label: "PostgreSQL", color: "336791", y: 1.4, rel: "SQL / EF Core" },
  { label: "Redis", color: "CC0000", y: 2.45, rel: "StackExchange" },
  { label: "RabbitMQ", color: "FF6600", y: 3.5, rel: "AMQP" },
];
extData.forEach(e => {
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.6, y: e.y, w: 1.9, h: 0.7, fill: { color: e.color }, rectRadius: 0.08, shadow: makeShadow() });
  s6.addText(e.label, { x: 7.6, y: e.y, w: 1.9, h: 0.7, fontSize: 10, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
  s6.addShape(pres.shapes.LINE, { x: 6.4, y: e.y + 0.35, w: 1.2, h: 0, line: { color: GRAY, width: 1.5 } });
  s6.addText(e.rel, { x: 6.42, y: e.y + 0.1, w: 1.15, h: 0.22, fontSize: 7.5, color: GRAY, fontFace: "Calibri", align: "center" });
});

// Other service above
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.8, y: 0.35, w: 2.4, h: 0.6, fill: { color: "6D2E46" }, rectRadius: 0.08, shadow: makeShadow() });
s6.addText("Otros Servicios ECI", { x: 3.8, y: 0.35, w: 2.4, h: 0.6, fontSize: 9.5, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
s6.addShape(pres.shapes.LINE, { x: 5.0, y: 0.95, w: 0, h: 0.95, line: { color: "6D2E46", width: 1.5 } });
s6.addText("Eventos via RabbitMQ", { x: 5.05, y: 1.15, w: 1.8, h: 0.22, fontSize: 7.5, color: "6D2E46", fontFace: "Calibri" });

s6.addNotes("Vista completa del contexto. Actores a la izquierda interactúan vía REST. Sistemas externos a la derecha son dependencias de infraestructura.");

// Slide 7: Resumen
let s7 = pres.addSlide();
s7.background = { color: DARK };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: PRIMARY } });
s7.addText("Resumen del Contexto C4", { x: 0.5, y: 0.15, w: 9, h: 0.65, fontSize: 22, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
const summary = [
  { icon: "1", text: "1 Sistema Central: Gamification Service (.NET 10, Hexagonal Architecture)", color: ACCENT },
  { icon: "2", text: "3 Tipos de Actores: Estudiante, Tutor, Administrador", color: "14B8A6" },
  { icon: "3", text: "3 Sistemas de Infraestructura: PostgreSQL (datos), Redis (cache), RabbitMQ (mensajería)", color: "02C39A" },
  { icon: "4", text: "Integración desacoplada: Eventos asincrónicos via broker de mensajes", color: "A8D8EA" },
];
summary.forEach((s, i) => {
  s7.addShape(pres.shapes.OVAL, { x: 0.5, y: 1.3 + i * 0.9, w: 0.55, h: 0.55, fill: { color: s.color } });
  s7.addText(s.icon, { x: 0.5, y: 1.3 + i * 0.9, w: 0.55, h: 0.55, fontSize: 16, bold: true, color: DARK, fontFace: "Cambria", align: "center", valign: "middle" });
  s7.addText(s.text, { x: 1.2, y: 1.35 + i * 0.9, w: 8.3, h: 0.5, fontSize: 13, color: WHITE, fontFace: "Calibri", valign: "middle" });
});
s7.addText("Gamification Service — Diagrama de Contexto C4 (Nivel 1)", { x: 0, y: 5.1, w: 10, h: 0.3, fontSize: 9, color: GRAY, fontFace: "Calibri", align: "center" });
s7.addNotes("Resumen del diagrama de contexto. El Gamification Service opera como un microservicio desacoplado con 3 actores y 3 dependencias externas clave.");

pres.writeFile({ fileName: "D:/ander/Documents/INTERSEMESTRAL/ECIWISE 2/gamification/presentations/01_C4_Contexto.pptx" })
  .then(() => console.log("✅ 01_C4_Contexto.pptx generado"))
  .catch(e => console.error("❌", e));
