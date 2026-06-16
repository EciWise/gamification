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
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: "336791" } });
  slide.addText(title, { x: 0.4, y: 0.18, w: 7.5, h: 0.7, fontSize: 24, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.4, y: 0.72, w: 8, h: 0.35, fontSize: 11, color: "A8D8EA", fontFace: "Calibri", margin: 0 });
  }
}

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Contenedores y Despliegue";

// Slide 1: Title
let s1 = pres.addSlide();
s1.background = { color: DARK };
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.3, w: 10, h: 1.325, fill: { color: "336791" } });
s1.addText("Contenedores y Despliegue", { x: 0.6, y: 0.85, w: 8.8, h: 1.0, fontSize: 40, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s1.addText("Infraestructura Docker & CI/CD", { x: 0.6, y: 2.0, w: 8.8, h: 0.6, fontSize: 22, color: ACCENT, fontFace: "Calibri", align: "center" });
s1.addText("Microservicio de Gamificación | EciWise 2", { x: 0.6, y: 2.75, w: 8.8, h: 0.45, fontSize: 16, color: "A8D8EA", fontFace: "Calibri", align: "center" });
s1.addText("Docker Compose • GitHub Actions • Entornos", { x: 0.6, y: 4.55, w: 8.8, h: 0.4, fontSize: 13, color: ACCENT, fontFace: "Calibri", align: "center" });
s1.addNotes("Vista de despliegue. Cómo se configura la infraestructura con Docker Compose para desarrollo local y CI/CD con GitHub Actions.");

// Slide 2: Docker Compose overview
let s2 = pres.addSlide();
addSlideHeader(s2, pres, "Docker Compose — Infraestructura Local", "docker-compose.yml: 3 servicios de infraestructura + red compartida");
const services = [
  {
    name: "postgres", image: "postgres:15-alpine", color: "336791",
    ports: ["5432:5432"], env: ["POSTGRES_DB=gamification_db", "POSTGRES_USER=gamification_user", "POSTGRES_PASSWORD=Segura123!"],
    volume: "postgres_data:/var/lib/postgresql/data", note: "Base de datos principal"
  },
  {
    name: "redis", image: "redis:7-alpine", color: "CC0000",
    ports: ["6379:6379"], env: ["(sin variables de entorno)"],
    volume: "redis_data:/data", note: "Cache de rankings"
  },
  {
    name: "rabbitmq", image: "rabbitmq:3.12-management-alpine", color: "FF6600",
    ports: ["5672:5672 (AMQP)", "15672:15672 (Management UI)"], env: ["RABBITMQ_DEFAULT_USER=guest", "RABBITMQ_DEFAULT_PASS=guest"],
    volume: "rabbitmq_data:/var/lib/rabbitmq", note: "Broker de mensajes"
  },
];
services.forEach((s, i) => {
  const x = 0.3 + i * 3.2;
  const y = 1.2;
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.05, h: 4.1, fill: { color: WHITE }, rectRadius: 0.12, shadow: makeShadow() });
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.05, h: 0.48, fill: { color: s.color }, rectRadius: 0.12 });
  s2.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.38, w: 3.05, h: 0.1, fill: { color: s.color } });
  s2.addText(s.name, { x: x + 0.1, y: y + 0.07, w: 1.5, h: 0.28, fontSize: 14, bold: true, color: WHITE, fontFace: "Cambria", margin: 0 });
  s2.addText(s.note, { x: x + 1.6, y: y + 0.1, w: 1.35, h: 0.25, fontSize: 8.5, color: WHITE, fontFace: "Calibri", align: "right", italic: true, margin: 0 });

  s2.addText("image:", { x: x + 0.12, y: y + 0.58, w: 0.65, h: 0.22, fontSize: 9, bold: true, color: s.color, fontFace: "Calibri", margin: 0 });
  s2.addText(s.image, { x: x + 0.77, y: y + 0.58, w: 2.18, h: 0.22, fontSize: 8.5, color: "334155", fontFace: "Calibri", margin: 0 });

  s2.addText("ports:", { x: x + 0.12, y: y + 0.88, w: 0.65, h: 0.22, fontSize: 9, bold: true, color: s.color, fontFace: "Calibri", margin: 0 });
  s.ports.forEach((p, j) => {
    s2.addText(`• ${p}`, { x: x + 0.22, y: y + 1.1 + j * 0.22, w: 2.73, h: 0.2, fontSize: 8.5, color: "334155", fontFace: "Calibri", margin: 0 });
  });

  const envY = y + 1.1 + s.ports.length * 0.22 + 0.08;
  s2.addText("environment:", { x: x + 0.12, y: envY, w: 1.2, h: 0.22, fontSize: 9, bold: true, color: s.color, fontFace: "Calibri", margin: 0 });
  s.env.forEach((e, j) => {
    s2.addText(`• ${e}`, { x: x + 0.22, y: envY + 0.22 + j * 0.2, w: 2.73, h: 0.2, fontSize: 7.5, color: "334155", fontFace: "Calibri", margin: 0 });
  });

  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.1, y: y + 3.75, w: 2.85, h: 0.28, fill: { color: LIGHT }, rectRadius: 0.06 });
  s2.addText(`Vol: ${s.volume}`, { x: x + 0.15, y: y + 3.77, w: 2.75, h: 0.24, fontSize: 7.5, color: GRAY, fontFace: "Calibri", italic: true });
});
// Network note
s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 5.15, w: 9.4, h: 0.28, fill: { color: ACCENT }, rectRadius: 0.06 });
s2.addText("Red compartida: gamification-net (bridge) — todos los servicios se comunican por nombre de servicio", {
  x: 0.35, y: 5.17, w: 9.3, h: 0.24, fontSize: 9.5, bold: true, color: DARK, fontFace: "Calibri", align: "center"
});
s2.addNotes("Docker Compose levanta 3 servicios de infraestructura. La API de .NET corre fuera de Docker en desarrollo local y se conecta a estos servicios.");

// Slide 3: Variables de Entorno
let s3 = pres.addSlide();
addSlideHeader(s3, pres, "Variables de Entorno — .env", "Configuración externalizada según el principio 12-Factor App");
const envGroups = [
  {
    title: "PostgreSQL", color: "336791",
    vars: [
      { k: "POSTGRES_CONNECTION", v: "Host=localhost;Port=5432;Database=gamification_db;Username=gamification_user;Password=Segura123!" },
      { k: "POSTGRES_HOST", v: "localhost" },
      { k: "POSTGRES_PORT", v: "5432" },
      { k: "POSTGRES_DB", v: "gamification_db" },
      { k: "POSTGRES_USER", v: "gamification_user" },
      { k: "POSTGRES_PASSWORD", v: "Segura123!" },
    ]
  },
  {
    title: "RabbitMQ", color: "FF6600",
    vars: [
      { k: "RABBITMQ_HOST", v: "localhost (por defecto)" },
      { k: "RABBITMQ_USER", v: "guest" },
      { k: "RABBITMQ_PASS", v: "guest" },
    ]
  },
  {
    title: "Redis", color: "CC0000",
    vars: [
      { k: "Redis:ConnectionString", v: "localhost" },
      { k: "Puerto por defecto", v: "6379" },
    ]
  },
];
envGroups.forEach((g, i) => {
  const y = 1.2 + i * 1.35;
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y, w: 9.4, h: 1.2, fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow() });
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y, w: 1.5, h: 1.2, fill: { color: g.color }, rectRadius: 0.1 });
  s3.addShape(pres.shapes.RECTANGLE, { x: 1.7, y, w: 0.1, h: 1.2, fill: { color: g.color } });
  s3.addText(g.title, { x: 0.35, y, w: 1.45, h: 1.2, fontSize: 12, bold: true, color: WHITE, fontFace: "Cambria", align: "center", valign: "middle" });
  const rows = g.vars.slice(0, 3);
  const rows2 = g.vars.slice(3);
  rows.forEach((v, j) => {
    s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.95, y: y + 0.1 + j * 0.33, w: 3.4, h: 0.28, fill: { color: LIGHT }, rectRadius: 0.05 });
    s3.addText(v.k, { x: 2.0, y: y + 0.13 + j * 0.33, w: 3.3, h: 0.22, fontSize: 8.5, bold: true, color: g.color, fontFace: "Calibri", margin: 0 });
    s3.addText(v.v, { x: 5.5, y: y + 0.13 + j * 0.33, w: 4.1, h: 0.22, fontSize: 8, color: "334155", fontFace: "Calibri", margin: 0 });
  });
  if (rows2.length > 0) {
    rows2.forEach((v, j) => {
      s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.95, y: y + 0.1 + (j + 3) * 0.33, w: 3.4, h: 0.28, fill: { color: LIGHT }, rectRadius: 0.05 });
      s3.addText(v.k, { x: 2.0, y: y + 0.13 + (j + 3) * 0.33, w: 3.3, h: 0.22, fontSize: 8.5, bold: true, color: g.color, fontFace: "Calibri", margin: 0 });
      s3.addText(v.v, { x: 5.5, y: y + 0.13 + (j + 3) * 0.33, w: 4.1, h: 0.22, fontSize: 8, color: "334155", fontFace: "Calibri", margin: 0 });
    });
  }
});
s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 5.22, w: 9.4, h: 0.28, fill: { color: LIGHT }, rectRadius: 0.06 });
s3.addText("appsettings.json y appsettings.Development.json sobreescriben valores por entorno. En producción se usan variables de entorno del host.", {
  x: 0.4, y: 5.24, w: 9.2, h: 0.24, fontSize: 9, color: GRAY, fontFace: "Calibri", italic: true
});
s3.addNotes("Las variables de entorno siguen el principio 12-Factor App: configuración externalizada del código. En producción se inyectan desde el orquestador.");

// Slide 4: CI/CD Pipeline
let s4 = pres.addSlide();
addSlideHeader(s4, pres, "CI/CD — GitHub Actions", ".github/workflows/ci-develop.yml — Pipeline de integración continua");
// Pipeline visual
const pipelineSteps = [
  { name: "Trigger", detail: "Push a branch\ndevelop / PR", color: "6D2E46" },
  { name: "Checkout", detail: "actions/checkout@v4\nCódigo fuente", color: "21295C" },
  { name: "Setup .NET", detail: "actions/setup-dotnet\n.NET 10 SDK", color: PRIMARY },
  { name: "Restore", detail: "dotnet restore\nNuGet packages", color: TEAL },
  { name: "Build", detail: "dotnet build\n--no-restore", color: "028090" },
  { name: "Test", detail: "dotnet test\n--no-build", color: "336791" },
];
pipelineSteps.forEach((s, i) => {
  const x = 0.25 + i * 1.6;
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.3, w: 1.45, h: 2.8, fill: { color: s.color }, rectRadius: 0.1, shadow: makeShadow() });
  s4.addShape(pres.shapes.OVAL, { x: x + 0.45, y: 1.15, w: 0.55, h: 0.55, fill: { color: WHITE }, shadow: makeShadow() });
  s4.addText(`${i + 1}`, { x: x + 0.45, y: 1.15, w: 0.55, h: 0.55, fontSize: 14, bold: true, color: s.color, fontFace: "Cambria", align: "center", valign: "middle" });
  s4.addText(s.name, { x: x + 0.05, y: 1.45, w: 1.35, h: 0.4, fontSize: 12, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
  s4.addShape(pres.shapes.LINE, { x: x + 0.2, y: 1.9, w: 1.05, h: 0, line: { color: WHITE, width: 0.75 } });
  s4.addText(s.detail, { x: x + 0.08, y: 1.97, w: 1.3, h: 1.0, fontSize: 9.5, color: LGRAY, fontFace: "Calibri", align: "center" });
  if (i < pipelineSteps.length - 1) {
    s4.addShape(pres.shapes.LINE, { x: x + 1.45, y: 2.7, w: 0.15, h: 0, line: { color: ACCENT, width: 2 } });
  }
});
// Details box
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.25, y: 4.3, w: 9.5, h: 1.05, fill: { color: LIGHT }, rectRadius: 0.1 });
s4.addText("Detalles del Pipeline:", { x: 0.4, y: 4.35, w: 2.0, h: 0.28, fontSize: 11, bold: true, color: PRIMARY, fontFace: "Calibri" });
s4.addText("• Los 3 proyectos de test corren: Domain.Tests (unit), Application.Tests (unit con Moq), Integration.Tests (E2E)\n• El build falla si cualquier test falla — garantiza que PR no rompa la build\n• Los tests de integración prueban el flujo completo: RabbitMQ → AssignPoints → PostgreSQL (GamificationE2ETests)", {
  x: 0.4, y: 4.65, w: 9.2, h: 0.65, fontSize: 9.5, color: "334155", fontFace: "Calibri"
});
s4.addNotes("El pipeline tiene 6 pasos. Corre en cada push al branch develop y en cada Pull Request. Garantiza que el código siempre compila y los tests pasan.");

// Slide 5: Arquitectura de despliegue
let s5 = pres.addSlide();
addSlideHeader(s5, pres, "Diagrama de Despliegue", "Topología de ejecución en ambiente de desarrollo local");
// Host machine
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.15, y: 1.15, w: 9.7, h: 4.15, fill: { color: "F8FAFC" }, rectRadius: 0.15 });
s5.addText("Máquina del Desarrollador / CI Server", { x: 0.3, y: 1.18, w: 9.4, h: 0.25, fontSize: 9, bold: true, color: GRAY, fontFace: "Calibri", italic: true });

// Docker Engine
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.35, y: 1.5, w: 5.3, h: 3.6, fill: { color: LIGHT }, rectRadius: 0.12 });
s5.addText("Docker Engine (docker-compose up)", { x: 0.5, y: 1.52, w: 5.0, h: 0.25, fontSize: 9.5, bold: true, color: "336791", fontFace: "Calibri" });

// Docker services
const dockerSvcs = [
  { name: "postgres", port: ":5432", color: "336791", x: 0.5, y: 1.85 },
  { name: "redis", port: ":6379", color: "CC0000", x: 0.5, y: 2.85 },
  { name: "rabbitmq", port: ":5672 / :15672", color: "FF6600", x: 0.5, y: 3.85 },
];
dockerSvcs.forEach(s => {
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: s.x, y: s.y, w: 5.0, h: 0.75, fill: { color: s.color }, rectRadius: 0.08, shadow: makeShadow() });
  s5.addText(`[Container] ${s.name}`, { x: s.x + 0.1, y: s.y + 0.1, w: 3.5, h: 0.3, fontSize: 10, bold: true, color: WHITE, fontFace: "Calibri" });
  s5.addText(s.port, { x: s.x + 3.6, y: s.y + 0.1, w: 1.3, h: 0.3, fontSize: 9.5, color: WHITE, fontFace: "Calibri", align: "right" });
  s5.addText("gamification-net (bridge)", { x: s.x + 0.1, y: s.y + 0.42, w: 4.8, h: 0.22, fontSize: 8, color: LGRAY, fontFace: "Calibri" });
});

// .NET Process
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.0, y: 1.5, w: 3.7, h: 3.6, fill: { color: WHITE }, rectRadius: 0.12, shadow: makeShadow() });
s5.addText("[.NET Process]\ndotnet run", { x: 6.1, y: 1.58, w: 3.5, h: 0.55, fontSize: 9.5, bold: true, color: PRIMARY, fontFace: "Calibri", align: "center" });
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.15, y: 2.2, w: 3.5, h: 0.55, fill: { color: PRIMARY }, rectRadius: 0.07 });
s5.addText("API (HTTP :5000/5001)", { x: 6.15, y: 2.2, w: 3.5, h: 0.55, fontSize: 9.5, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.15, y: 2.85, w: 3.5, h: 0.55, fill: { color: TEAL }, rectRadius: 0.07 });
s5.addText("RabbitMqConsumer (BG)", { x: 6.15, y: 2.85, w: 3.5, h: 0.55, fontSize: 9.5, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.15, y: 3.5, w: 3.5, h: 0.55, fill: { color: "028090" }, rectRadius: 0.07 });
s5.addText("OutboxWorker + RankingJob (BG)", { x: 6.15, y: 3.5, w: 3.5, h: 0.55, fontSize: 9, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle" });

// Arrows
s5.addShape(pres.shapes.LINE, { x: 5.5, y: 2.22, w: 0.5, h: 0, line: { color: PRIMARY, width: 1.5 } });
s5.addShape(pres.shapes.LINE, { x: 5.5, y: 3.22, w: 0.5, h: 0, line: { color: "CC0000", width: 1.5 } });
s5.addShape(pres.shapes.LINE, { x: 5.5, y: 4.22, w: 0.5, h: 0, line: { color: "FF6600", width: 1.5 } });

// Swagger badge
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.15, y: 4.15, w: 3.5, h: 0.7, fill: { color: LIGHT }, rectRadius: 0.07 });
s5.addText("Swagger UI\nlocalhost:5000/swagger", { x: 6.15, y: 4.15, w: 3.5, h: 0.7, fontSize: 9.5, color: PRIMARY, fontFace: "Calibri", align: "center", valign: "middle" });
s5.addNotes("En desarrollo local: Docker corre la infraestructura (DB, Redis, RabbitMQ) y .NET corre el proceso de la API con sus background services.");

// Slide 6: Resumen
let s6 = pres.addSlide();
s6.background = { color: DARK };
s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: "336791" } });
s6.addText("Resumen — Contenedores y Despliegue", { x: 0.5, y: 0.15, w: 9, h: 0.65, fontSize: 22, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
const sumD = [
  { t: "Docker Compose", c: "336791", d: "3 servicios: PostgreSQL 15, Redis 7, RabbitMQ 3.12. Misma red (gamification-net). Volúmenes persistentes." },
  { t: "Variables de Entorno", c: "6D2E46", d: "Configuración externalizada en .env. appsettings.json por entorno (Development / Production). 12-Factor App." },
  { t: "CI/CD Pipeline", c: "21295C", d: "GitHub Actions: 6 pasos (checkout → setup → restore → build → test). Corre en push y PR al branch develop." },
  { t: "Despliegue Local", c: PRIMARY, d: "docker-compose up levanta infra. dotnet run lanza API + 3 Background Services en el mismo proceso. Swagger en :5000/swagger." },
];
sumD.forEach((s, i) => {
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.15 + i * 0.95, w: 9.4, h: 0.82, fill: { color: s.c }, rectRadius: 0.1, shadow: makeShadow() });
  s6.addText(s.t, { x: 0.45, y: 1.22 + i * 0.95, w: 2.1, h: 0.65, fontSize: 12, bold: true, color: WHITE, fontFace: "Cambria", valign: "middle" });
  s6.addShape(pres.shapes.LINE, { x: 2.55, y: 1.3 + i * 0.95, w: 0, h: 0.5, line: { color: WHITE, width: 1 } });
  s6.addText(s.d, { x: 2.7, y: 1.23 + i * 0.95, w: 6.85, h: 0.65, fontSize: 11.5, color: WHITE, fontFace: "Calibri", valign: "middle" });
});
s6.addText("Gamification Service — Contenedores y Despliegue", { x: 0, y: 5.1, w: 10, h: 0.3, fontSize: 9, color: GRAY, fontFace: "Calibri", align: "center" });
s6.addNotes("El despliegue está preparado para desarrollo local con Docker Compose. CI/CD con GitHub Actions garantiza integración continua en el branch develop.");

pres.writeFile({ fileName: "D:/ander/Documents/INTERSEMESTRAL/ECIWISE 2/gamification/presentations/05_Contenedores_Despliegue.pptx" })
  .then(() => console.log("✅ 05_Contenedores_Despliegue.pptx generado"))
  .catch(e => console.error("❌", e));
