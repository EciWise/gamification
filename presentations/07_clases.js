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
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: "028090" } });
  slide.addText(title, { x: 0.4, y: 0.18, w: 7.5, h: 0.7, fontSize: 24, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.4, y: 0.72, w: 8, h: 0.35, fontSize: 11, color: "A8D8EA", fontFace: "Calibri", margin: 0 });
  }
}

// Draw a UML-style class box
function drawClass(slide, pres, x, y, w, name, stereotype, props, methods, color) {
  const lineH = 0.18;
  const headerH = stereotype ? 0.6 : 0.45;
  const propsH = props.length * lineH + 0.08;
  const methH = methods.length * lineH + 0.08;
  const totalH = headerH + propsH + 0.08 + methH;

  // Box
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: totalH, fill: { color: WHITE }, rectRadius: 0.07, shadow: makeShadow() });
  // Header
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: headerH, fill: { color }, rectRadius: 0.07 });
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y + headerH - 0.1, w, h: 0.1, fill: { color } });
  if (stereotype) {
    slide.addText(`«${stereotype}»`, { x: x + 0.05, y: y + 0.04, w: w - 0.1, h: 0.18, fontSize: 7.5, color: WHITE, fontFace: "Calibri", italic: true, align: "center", margin: 0 });
    slide.addText(name, { x: x + 0.05, y: y + 0.22, w: w - 0.1, h: 0.28, fontSize: 10, bold: true, color: WHITE, fontFace: "Cambria", align: "center", margin: 0 });
  } else {
    slide.addText(name, { x: x + 0.05, y: y + 0.1, w: w - 0.1, h: 0.3, fontSize: 10, bold: true, color: WHITE, fontFace: "Cambria", align: "center", margin: 0 });
  }
  // Divider
  slide.addShape(pres.shapes.LINE, { x: x + 0.05, y: y + headerH + 0.04, w: w - 0.1, h: 0, line: { color: LGRAY, width: 0.5 } });
  // Props
  props.forEach((p, i) => {
    slide.addText(p, { x: x + 0.08, y: y + headerH + 0.06 + i * lineH, w: w - 0.16, h: lineH, fontSize: 7.5, color: "1E293B", fontFace: "Calibri", margin: 0 });
  });
  // Second divider
  slide.addShape(pres.shapes.LINE, { x: x + 0.05, y: y + headerH + propsH + 0.04, w: w - 0.1, h: 0, line: { color: LGRAY, width: 0.5 } });
  // Methods
  methods.forEach((m, i) => {
    slide.addText(m, { x: x + 0.08, y: y + headerH + propsH + 0.06 + i * lineH, w: w - 0.16, h: lineH, fontSize: 7.5, color: "334155", fontFace: "Calibri", italic: true, margin: 0 });
  });
  return { x, y, w, h: totalH };
}

function arrow(slide, pres, x1, y1, x2, y2, label, color, dashed) {
  slide.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.01, h: Math.abs(y2 - y1) || 0.01, line: { color: color || GRAY, width: 1, dashType: dashed ? "dash" : "solid" } });
}

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Diagrama de Clases";

// Slide 1: Title
let s1 = pres.addSlide();
s1.background = { color: DARK };
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.3, w: 10, h: 1.325, fill: { color: "028090" } });
s1.addText("Diagrama de Clases", { x: 0.6, y: 0.85, w: 8.8, h: 1.0, fontSize: 42, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
s1.addText("Modelo de Dominio — Domain-Driven Design", { x: 0.6, y: 2.0, w: 8.8, h: 0.6, fontSize: 22, color: ACCENT, fontFace: "Calibri", align: "center" });
s1.addText("Microservicio de Gamificación | EciWise 2", { x: 0.6, y: 2.75, w: 8.8, h: 0.45, fontSize: 16, color: "A8D8EA", fontFace: "Calibri", align: "center" });
s1.addText("Aggregates • Entities • Value Objects • Ports • Adapters", { x: 0.6, y: 4.55, w: 8.8, h: 0.4, fontSize: 13, color: ACCENT, fontFace: "Calibri", align: "center" });
s1.addNotes("El Diagrama de Clases muestra la estructura completa del dominio. Se divide en múltiples slides por la riqueza del modelo.");

// Slide 2: Aggregates
let s2 = pres.addSlide();
addSlideHeader(s2, pres, "Aggregates — Raíces del Dominio", "AggregateRoot protege las invariantes del negocio");

drawClass(s2, pres, 0.2, 1.15, 2.8, "AggregateRoot", "abstract",
  ["# _domainEvents: List<DomainEvent>"],
  ["+ AddDomainEvent(event)", "+ ClearDomainEvents()", "+ GetDomainEvents(): IReadOnlyList"],
  GRAY);

drawClass(s2, pres, 3.6, 1.15, 3.0, "UserGamification", "AggregateRoot",
  ["+ Id: Guid", "+ UserId: UserId", "+ TotalPoints: Points", "+ CurrentLevel: LevelDefinition", "+ ReputationScore: ReputationScore", "+ ActionStats: List<UserActionStat>", "+ Achievements: List<UserAchievement>"],
  ["+ AddPoints(transaction: PointTransaction)", "+ IncrementStat(action: ActionType)", "+ GetStat(action: ActionType): UserActionStat", "+ UnlockAchievement(achievement: AchievementDefinition)"],
  PRIMARY);

drawClass(s2, pres, 0.2, 3.35, 2.8, "AchievementDefinition", "AggregateRoot",
  ["+ Id: Guid", "+ Name: string", "+ Description: string", "+ ImageUrl: string", "+ StrategyKey: string", "+ CriteriaConfig: CriteriaConfig", "+ IsActive: bool"],
  ["+ Deactivate()", "+ UpdateCriteria(config)"],
  "21295C");

drawClass(s2, pres, 3.6, 3.8, 3.0, "Ranking", "AggregateRoot",
  ["+ Id: Guid", "+ Type: RankingType", "+ Period: DateRange", "+ SubjectCode: SubjectCode?", "+ Entries: List<RankingEntry>"],
  ["+ Recalculate(data: List<UserRankingData>)", "+ GetUserPosition(userId: UserId): RankingEntry?"],
  TEAL);

// Inheritance arrows
s2.addShape(pres.shapes.LINE, { x: 3.0, y: 1.9, w: 0.6, h: 0, line: { color: GRAY, width: 1 } });
s2.addText("extends", { x: 3.02, y: 1.72, w: 0.56, h: 0.2, fontSize: 7, color: GRAY, fontFace: "Calibri", align: "center", italic: true });
s2.addShape(pres.shapes.LINE, { x: 1.6, y: 2.5, w: 0, h: 0.85, line: { color: GRAY, width: 1, dashType: "dash" } });
s2.addShape(pres.shapes.LINE, { x: 1.6, y: 3.35, w: 0.6, h: 0, line: { color: GRAY, width: 1 } });
s2.addText("extends", { x: 1.62, y: 3.15, w: 0.56, h: 0.2, fontSize: 7, color: GRAY, fontFace: "Calibri", align: "center", italic: true });
s2.addShape(pres.shapes.LINE, { x: 5.1, y: 3.3, w: 0, h: 0.5, line: { color: GRAY, width: 1, dashType: "dash" } });
s2.addText("extends", { x: 5.12, y: 3.5, w: 0.56, h: 0.2, fontSize: 7, color: GRAY, fontFace: "Calibri", align: "center", italic: true });

// Composition: UserGamification has many PointTransactions
drawClass(s2, pres, 7.0, 1.15, 2.8, "PointTransaction", "Entity",
  ["+ Id: Guid", "+ UserId: UserId", "+ Points: Points", "+ ActionType: ActionType", "+ Description: EventDescription", "+ SourceEventId: Guid", "+ IdempotencyKey: IdempotencyKey", "+ OccurredAt: DateTime"],
  [],
  "6D2E46");

s2.addShape(pres.shapes.LINE, { x: 6.6, y: 2.2, w: 0.4, h: 0, line: { color: "6D2E46", width: 1 } });
s2.addText("1..*", { x: 6.38, y: 2.05, w: 0.5, h: 0.2, fontSize: 8, color: "6D2E46", fontFace: "Calibri", align: "center" });
s2.addText("has", { x: 6.38, y: 2.22, w: 0.5, h: 0.2, fontSize: 7, color: GRAY, fontFace: "Calibri", align: "center", italic: true });

drawClass(s2, pres, 7.0, 3.4, 2.8, "RankingEntry", "Entity",
  ["+ Id: Guid", "+ UserId: UserId", "+ Position: int", "+ Score: decimal", "+ ComputedAt: DateTime"],
  [],
  TEAL);

s2.addShape(pres.shapes.LINE, { x: 6.6, y: 4.1, w: 0.4, h: 0, line: { color: TEAL, width: 1 } });
s2.addText("1..*", { x: 6.38, y: 3.95, w: 0.5, h: 0.2, fontSize: 8, color: TEAL, fontFace: "Calibri", align: "center" });
s2.addText("has", { x: 6.38, y: 4.12, w: 0.5, h: 0.2, fontSize: 7, color: GRAY, fontFace: "Calibri", align: "center", italic: true });

s2.addNotes("Tres Aggregates: UserGamification (principal), AchievementDefinition y Ranking. Cada uno extiende AggregateRoot que maneja Domain Events.");

// Slide 3: Entities
let s3 = pres.addSlide();
addSlideHeader(s3, pres, "Entities — Identidad por ID", "Entidades del dominio con identidad única (Guid)");

drawClass(s3, pres, 0.2, 1.15, 2.8, "Entity", "abstract",
  ["+ Id: Guid"],
  ["+ Equals(obj): bool", "+ GetHashCode(): int"],
  GRAY);

const entities = [
  {
    x: 3.4, y: 1.15, name: "LevelDefinition", props: ["+ Id: Guid", "+ Name: string", "+ MinPoints: Points"],
    methods: [], color: PRIMARY
  },
  {
    x: 6.5, y: 1.15, name: "UserAchievement", props: ["+ Id: Guid", "+ UserId: UserId", "+ Achievement: AchievementDefinition", "+ UnlockedAt: DateTime"],
    methods: [], color: "21295C"
  },
  {
    x: 0.2, y: 3.2, name: "UserLevelHistory", props: ["+ Id: Guid", "+ UserId: UserId", "+ Level: LevelDefinition", "+ PointsAtThatMoment: Points", "+ AchievedAt: DateTime"],
    methods: [], color: "6D2E46"
  },
  {
    x: 3.4, y: 3.2, name: "WeeklyActivity", props: ["+ Id: Guid", "+ UserId: UserId", "+ WeekStart: DateTime", "+ PointsEarned: Points", "+ ActionsCount: int", "+ RecordedAt: DateTime"],
    methods: ["+ AddPoints(p: Points)"], color: TEAL
  },
  {
    x: 6.5, y: 3.2, name: "GamificationRule", props: ["+ Id: Guid", "+ ActionType: ActionType", "+ PointsAwarded: Points", "+ IsActive: bool"],
    methods: ["+ Deactivate()"], color: "028090"
  },
];
entities.forEach(e => {
  drawClass(s3, pres, e.x, e.y, 2.9, e.name, "Entity", e.props, e.methods, e.color);
  // Inheritance line to Entity
  s3.addShape(pres.shapes.LINE, { x: e.x + 1.45, y: e.y, w: 0, h: 0.12, line: { color: GRAY, width: 1, dashType: "dash" } });
});
s3.addText("Todas las entidades extienden Entity (identidad por Id)", { x: 0.2, y: 5.2, w: 9.6, h: 0.25, fontSize: 9, color: GRAY, fontFace: "Calibri", italic: true, align: "center" });
s3.addNotes("5 entidades más Entity base. Se comparan por Id (Guid). LevelDefinition y GamificationRule son entidades de configuración del sistema.");

// Slide 4: Value Objects
let s4 = pres.addSlide();
addSlideHeader(s4, pres, "Value Objects — Inmutables y por Valor", "Sin identidad propia — igualdad por sus componentes");

drawClass(s4, pres, 0.2, 1.15, 2.5, "ValueObject", "abstract",
  [],
  ["# GetEqualityComponents(): IEnumerable", "+ Equals(obj): bool", "+ GetHashCode(): int"],
  GRAY);

const vos = [
  { x: 0.2, y: 2.5, name: "Points", props: ["+ Value: int (≥ 0)"], methods: ["+ Add(other: Points): Points", "+ static Zero: Points"], color: PRIMARY },
  { x: 3.0, y: 2.5, name: "UserId", props: ["+ Value: Guid (non-empty)"], methods: [], color: "21295C" },
  { x: 5.6, y: 2.5, name: "ReputationScore", props: ["+ Value: decimal (≥ 0)"], methods: [], color: TEAL },
  { x: 8.2, y: 2.5, name: "DateRange", props: ["+ Start: DateTime", "+ End: DateTime (>= Start)"], methods: [], color: "028090" },
  { x: 0.2, y: 4.05, name: "UserActionStat", props: ["+ ActionType: ActionType", "+ Count: int", "+ LastUpdated: DateTime"], methods: ["+ Increment(n: int): UserActionStat"], color: "6D2E46" },
  { x: 3.0, y: 4.05, name: "SubjectCode", props: ["+ Value: string (non-empty)"], methods: [], color: "065A82" },
  { x: 5.6, y: 4.05, name: "IdempotencyKey", props: ["+ Value: string (non-empty)"], methods: [], color: "6D2E46" },
  { x: 8.2, y: 4.05, name: "CriteriaConfig", props: ["+ JsonRaw: string"], methods: ["+ Deserialize<T>(): T"], color: "028090" },
  { x: 0.2, y: 5.25, name: "EventDescription", props: ["+ Value: string"], methods: [], color: TEAL },
  { x: 3.0, y: 5.25, name: "AchievementContext", props: ["+ SourceEventId: Guid", "+ OccurredAt: DateTime"], methods: [], color: PRIMARY },
  { x: 5.6, y: 5.25, name: "UserRankingData", props: ["+ UserId: UserId", "+ Score: decimal"], methods: [], color: "21295C" },
];
vos.forEach(vo => {
  drawClass(s4, pres, vo.x, vo.y, 2.6, vo.name, "ValueObject", vo.props, vo.methods, vo.color);
});
s4.addNotes("11 Value Objects. Son inmutables: nunca se modifican, se crean nuevas instancias. Se comparan por valor, no por referencia. Incluyen validación en el constructor.");

// Slide 5: Domain Events & Enums
let s5 = pres.addSlide();
addSlideHeader(s5, pres, "Domain Events & Enums", "Eventos de dominio y tipos enumerados del negocio");

// Domain Events
drawClass(s5, pres, 0.2, 1.15, 3.5, "DomainEvent", "abstract",
  ["+ EventId: Guid", "+ OccurredAt: DateTime"],
  [],
  GRAY);

const events = [
  { name: "PointsAddedEvent", props: ["+ UserId: UserId", "+ Points: Points", "+ ActionType: ActionType", "+ TransactionId: Guid"] },
  { name: "AchievementUnlockedEvent", props: ["+ UserId: UserId", "+ AchievementId: Guid", "+ AchievementName: string"] },
  { name: "LevelUpEvent", props: ["+ UserId: UserId", "+ NewLevel: string", "+ PointsAtLevel: Points"] },
  { name: "LowRatingAlertEvent", props: ["+ UserId: UserId", "+ Rating: decimal", "+ Threshold: decimal"] },
];
events.forEach((e, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.2 + col * 3.8;
  const y = 2.45 + row * 1.45;
  drawClass(s5, pres, x, y, 3.5, e.name, "DomainEvent", e.props, [], "6D2E46");
  // Inheritance
  s5.addShape(pres.shapes.LINE, { x: x + 1.75, y: y, w: 0, h: 0.15, line: { color: GRAY, width: 1, dashType: "dash" } });
});
s5.addText("extends", { x: 0.2, y: 2.28, w: 3.5, h: 0.2, fontSize: 8, color: GRAY, fontFace: "Calibri", italic: true, align: "center" });

// Enums
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.6, y: 1.15, w: 2.2, h: 2.5, fill: { color: WHITE }, rectRadius: 0.08, shadow: makeShadow() });
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.6, y: 1.15, w: 2.2, h: 0.38, fill: { color: "21295C" }, rectRadius: 0.08 });
s5.addShape(pres.shapes.RECTANGLE, { x: 7.6, y: 1.43, w: 2.2, h: 0.1, fill: { color: "21295C" } });
s5.addText("«enum»\nActionType", { x: 7.65, y: 1.17, w: 2.1, h: 0.35, fontSize: 10, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
const actionTypes = ["TutoriaCompletada", "TutoriaDictada", "MaterialAprobado", "TutoriaCalificada", "ForoPublicado"];
actionTypes.forEach((a, i) => {
  s5.addText(`• ${a}`, { x: 7.7, y: 1.6 + i * 0.22, w: 2.0, h: 0.2, fontSize: 8.5, color: "1E293B", fontFace: "Calibri" });
});

s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.6, y: 3.85, w: 2.2, h: 1.55, fill: { color: WHITE }, rectRadius: 0.08, shadow: makeShadow() });
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.6, y: 3.85, w: 2.2, h: 0.38, fill: { color: TEAL }, rectRadius: 0.08 });
s5.addShape(pres.shapes.RECTANGLE, { x: 7.6, y: 4.13, w: 2.2, h: 0.1, fill: { color: TEAL } });
s5.addText("«enum»\nRankingType", { x: 7.65, y: 3.87, w: 2.1, h: 0.35, fontSize: 10, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
const rankingTypes = ["GlobalPorPuntos", "TutoresMejorCalificados", "TopDelMes", "PorMateria"];
rankingTypes.forEach((r, i) => {
  s5.addText(`• ${r}`, { x: 7.7, y: 4.3 + i * 0.24, w: 2.0, h: 0.22, fontSize: 8, color: "1E293B", fontFace: "Calibri" });
});
s5.addNotes("4 Domain Events se publican a RabbitMQ via Outbox. ActionType define las 5 acciones que generan puntos. RankingType define los 4 tipos de ranking.");

// Slide 6: Ports & Adapters (Interfaces & Implementations)
let s6 = pres.addSlide();
addSlideHeader(s6, pres, "Ports & Adapters — Interfaces e Implementaciones", "Inversión de dependencias: Domain define contratos, Infrastructure los implementa");

const ports6 = [
  {
    iface: "IUserGamificationRepository", impl: "UserGamificationRepository",
    methods: ["GetByUserIdAsync(userId): Task<UserGamification?>", "SaveAsync(entity): Task"],
    color: PRIMARY
  },
  {
    iface: "IAchievementDefinitionRepository", impl: "AchievementDefinitionRepository",
    methods: ["GetByIdAsync(id): Task<AchievementDefinition?>", "GetAllActiveAsync(): Task<List<>>", "SaveAsync(entity): Task"],
    color: "21295C"
  },
  {
    iface: "IGamificationRuleRepository", impl: "GamificationRuleRepository",
    methods: ["GetByActionTypeAsync(type): Task<GamificationRule?>", "GetAllActiveAsync(): Task<List<>>"],
    color: TEAL
  },
  {
    iface: "IRankingRepository", impl: "RankingRepository",
    methods: ["GetCurrentAsync(type, code): Task<Ranking?>", "SaveAsync(entity): Task"],
    color: "028090"
  },
  {
    iface: "IRankingCache", impl: "RedisRankingCache",
    methods: ["GetTopRankingsAsync(type, code): Task<string?>", "SetTopRankingsAsync(type, code, data): Task", "InvalidateRankingAsync(type, code): Task"],
    color: "CC0000"
  },
  {
    iface: "IRabbitMqProducer", impl: "RabbitMqProducer",
    methods: ["PublishAsync<T>(exchange, routingKey, msg): Task"],
    color: "FF6600"
  },
];
ports6.forEach((p, i) => {
  const col = i % 2, row = Math.floor(i / 3);
  const x = 0.2 + col * 5.0;
  const y = 1.2 + row * 1.5;

  // Interface box
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.25, h: 0.38 + p.methods.length * 0.18, fill: { color: LIGHT }, rectRadius: 0.07, shadow: makeShadow() });
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.25, h: 0.35, fill: { color: p.color }, rectRadius: 0.07 });
  s6.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.25, w: 2.25, h: 0.1, fill: { color: p.color } });
  s6.addText("«interface»", { x: x + 0.05, y: y + 0.02, w: 2.15, h: 0.16, fontSize: 7.5, color: WHITE, fontFace: "Calibri", italic: true, align: "center" });
  s6.addText(p.iface.replace("I", ""), { x: x + 0.05, y: y + 0.18, w: 2.15, h: 0.15, fontSize: 8.5, bold: true, color: WHITE, fontFace: "Calibri", align: "center" });
  p.methods.forEach((m, j) => {
    s6.addText(`+ ${m}`, { x: x + 0.07, y: y + 0.38 + j * 0.18, w: 2.1, h: 0.17, fontSize: 7, color: "334155", fontFace: "Calibri", italic: true });
  });

  // Arrow
  const arrowX = x + 2.25;
  s6.addShape(pres.shapes.LINE, { x: arrowX, y: y + 0.4, w: 0.35, h: 0, line: { color: p.color, width: 1.5, dashType: "dash" } });
  s6.addText("impl.", { x: arrowX, y: y + 0.22, w: 0.35, h: 0.18, fontSize: 7, color: p.color, fontFace: "Calibri", align: "center" });

  // Impl box
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: arrowX + 0.35, y, w: 2.2, h: 0.38 + p.methods.length * 0.18, fill: { color: WHITE }, rectRadius: 0.07, shadow: makeShadow() });
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: arrowX + 0.35, y, w: 2.2, h: 0.35, fill: { color: p.color }, rectRadius: 0.07 });
  s6.addShape(pres.shapes.RECTANGLE, { x: arrowX + 0.35, y: y + 0.25, w: 2.2, h: 0.1, fill: { color: p.color } });
  s6.addText("«class»", { x: arrowX + 0.4, y: y + 0.02, w: 2.1, h: 0.16, fontSize: 7.5, color: WHITE, fontFace: "Calibri", italic: true, align: "center" });
  s6.addText(p.impl, { x: arrowX + 0.4, y: y + 0.18, w: 2.1, h: 0.15, fontSize: 8.5, bold: true, color: WHITE, fontFace: "Calibri", align: "center" });
  p.methods.forEach((m, j) => {
    s6.addText(`+ ${m}`, { x: arrowX + 0.42, y: y + 0.38 + j * 0.18, w: 2.05, h: 0.17, fontSize: 7, color: "334155", fontFace: "Calibri" });
  });
});
s6.addNotes("6 pares Port→Adapter. El DI container (Program.cs) registra cada implementación contra su interfaz. El Domain solo conoce las interfaces.");

// Slide 7: Domain Services & Strategy Pattern
let s7 = pres.addSlide();
addSlideHeader(s7, pres, "Domain Services & Strategy Pattern", "Servicios del dominio y estrategias de desbloqueo de logros");

drawClass(s7, pres, 0.2, 1.15, 3.4, "GamificationDomainService", "DomainService",
  ["- _achievementRepo: IAchievementDefinitionRepository", "- _strategyFactory: IAchievementStrategyFactory"],
  ["+ EvaluateAchievements(user: UserGamification, context: AchievementContext): List<AchievementDefinition>"],
  PRIMARY);

drawClass(s7, pres, 0.2, 3.0, 3.4, "IAchievementStrategyFactory", "interface",
  [],
  ["+ GetStrategy(strategyKey: string): IAchievementStrategy"],
  TEAL);

drawClass(s7, pres, 3.9, 1.15, 3.1, "IAchievementStrategy", "interface",
  ["+ StrategyKey: string"],
  ["+ Evaluate(user: UserGamification, stats: List<UserActionStat>, config: CriteriaConfig, ctx: AchievementContext): bool"],
  "21295C");

// Strategy implementations
const strategies = [
  { name: "FirstTutoringStrategy", key: "FIRST_TUTORING", logic: "TutoriaDictada >= 1" },
  { name: "ActiveCollaboratorStrategy", key: "ACTIVE_COLLABORATOR", logic: "MaterialAprobado >= 5" },
  { name: "OutstandingTutorStrategy", key: "OUTSTANDING_TUTOR", logic: "TutoriaCalificada >= 10" },
  { name: "MentorOfMonthStrategy", key: "MENTOR_OF_MONTH", logic: "Evaluación periódica global" },
];
strategies.forEach((s, i) => {
  const y = 1.15 + i * 1.05;
  drawClass(s7, pres, 7.2, y, 2.6, s.name, "Strategy",
    [`StrategyKey = "${s.key}"`, `Logic: ${s.logic}`],
    ["+ Evaluate(...): bool"],
    "6D2E46");
  // implements IAchievementStrategy
  s7.addShape(pres.shapes.LINE, { x: 7.0, y: y + 0.5, w: 0.2, h: 0, line: { color: "21295C", width: 1, dashType: "dash" } });
});
// Arrow: IAchievementStrategy ← strategies
s7.addText("implements →", { x: 6.9, y: 2.45, w: 0.5, h: 0.3, fontSize: 7.5, color: "21295C", fontFace: "Calibri", italic: true });
// Arrow: DomainService uses Factory
s7.addShape(pres.shapes.LINE, { x: 1.9, y: 3.0, w: 0, h: 0.3, line: { color: TEAL, width: 1, dashType: "dash" } });
s7.addText("uses →", { x: 1.92, y: 3.3, w: 0.5, h: 0.2, fontSize: 7.5, color: TEAL, fontFace: "Calibri", italic: true });
// Arrow: DomainService uses Strategy
s7.addShape(pres.shapes.LINE, { x: 3.6, y: 2.1, w: 0.3, h: 0, line: { color: "21295C", width: 1, dashType: "dash" } });
s7.addText("→", { x: 3.62, y: 1.95, w: 0.28, h: 0.2, fontSize: 10, color: "21295C", fontFace: "Calibri", align: "center" });
s7.addNotes("Strategy Pattern para logros: cada tipo de logro tiene una estrategia de evaluación independiente. Factory resuelve la estrategia por StrategyKey en tiempo de ejecución.");

// Slide 8: CQRS Classes
let s8 = pres.addSlide();
addSlideHeader(s8, pres, "Clases CQRS — Application Layer", "Commands, Queries y sus Handlers con MediatR");

drawClass(s8, pres, 0.2, 1.15, 2.9, "AssignPointsCommand", "IRequest<bool>",
  ["+ UserId: Guid", "+ Points: int", "+ ActionType: ActionType", "+ SourceEventId: Guid"],
  [],
  PRIMARY);

drawClass(s8, pres, 0.2, 2.85, 2.9, "UnlockAchievementCommand", "IRequest<bool>",
  ["+ UserId: Guid", "+ AchievementId: Guid", "+ Context: AchievementContext"],
  [],
  "21295C");

drawClass(s8, pres, 3.5, 1.15, 2.9, "AssignPointsCommandHandler", "IRequestHandler<AssignPointsCommand,bool>",
  ["- _userRepo: IUserGamificationRepository", "- _ruleRepo: IGamificationRuleRepository"],
  ["+ Handle(cmd, ct): Task<bool>"],
  PRIMARY);

drawClass(s8, pres, 0.2, 4.2, 2.9, "GetUserRankingQuery", "IRequest<UserRankingDto?>",
  ["+ UserId: Guid", "+ Type: RankingType"],
  [],
  TEAL);

drawClass(s8, pres, 3.5, 3.25, 2.9, "RankingQueryHandlers", "IRequestHandler (multiple)",
  ["- _rankingRepo: IRankingRepository", "- _cache: IRankingCache"],
  ["+ Handle(GetUserRankingQuery, ct)", "+ Handle(GetTopRankingQuery, ct)", "+ Handle(GetUserAchievementsQuery, ct)"],
  TEAL);

drawClass(s8, pres, 7.0, 1.15, 2.8, "UserRankingDto", "DTO",
  ["+ UserId: Guid", "+ Position: int", "+ Score: decimal"],
  [],
  "028090");

drawClass(s8, pres, 7.0, 2.6, 2.8, "AchievementDto", "DTO",
  ["+ Id: Guid", "+ Name: string", "+ Description: string", "+ ImageUrl: string", "+ UnlockedAt: DateTime"],
  [],
  "6D2E46");

// Arrows
s8.addShape(pres.shapes.LINE, { x: 3.1, y: 1.8, w: 0.4, h: 0, line: { color: PRIMARY, width: 1 } });
s8.addText("→", { x: 3.12, y: 1.65, w: 0.38, h: 0.2, fontSize: 10, color: PRIMARY, fontFace: "Calibri" });
s8.addShape(pres.shapes.LINE, { x: 3.1, y: 4.5, w: 0.4, h: 0, line: { color: TEAL, width: 1 } });
s8.addText("→", { x: 3.12, y: 4.35, w: 0.38, h: 0.2, fontSize: 10, color: TEAL, fontFace: "Calibri" });
s8.addShape(pres.shapes.LINE, { x: 6.4, y: 2.0, w: 0.6, h: 0, line: { color: "028090", width: 1, dashType: "dash" } });
s8.addText("returns →", { x: 6.42, y: 1.82, w: 0.56, h: 0.2, fontSize: 7.5, color: "028090", fontFace: "Calibri" });
s8.addNotes("Los Commands y Queries son POCOs simples. Los Handlers orquestan el dominio. Los DTOs son la respuesta al cliente, sin lógica de negocio.");

// Slide 9: Resumen
let s9 = pres.addSlide();
s9.background = { color: DARK };
s9.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: "028090" } });
s9.addText("Resumen — Diagrama de Clases", { x: 0.5, y: 0.15, w: 9, h: 0.65, fontSize: 22, bold: true, color: WHITE, fontFace: "Cambria", align: "center" });
const sumC = [
  { t: "Aggregates (3)", c: PRIMARY, d: "UserGamification (root principal), AchievementDefinition, Ranking. Extienden AggregateRoot con soporte para Domain Events." },
  { t: "Entities (7)", c: "21295C", d: "Entity base + PointTransaction, LevelDefinition, UserAchievement, UserLevelHistory, WeeklyActivity, GamificationRule, RankingEntry." },
  { t: "Value Objects (11)", c: TEAL, d: "Points, UserId, DateRange, UserActionStat, ReputationScore, SubjectCode, IdempotencyKey, CriteriaConfig, EventDescription, AchievementContext, UserRankingData." },
  { t: "Ports & Adapters (6)", c: "028090", d: "IUserGamificationRepo, IAchievementDefRepo, IGamificationRuleRepo, IRankingRepo, IRankingCache, IRabbitMqProducer → sus implementaciones en Infrastructure." },
  { t: "CQRS (8 clases)", c: "6D2E46", d: "2 Commands + 3 Queries + AssignPointsCommandHandler + RankingQueryHandlers + DTOs de respuesta (UserRankingDto, AchievementDto)." },
];
sumC.forEach((s, i) => {
  s9.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 1.1 + i * 0.85, w: 9.4, h: 0.72, fill: { color: s.c }, rectRadius: 0.1, shadow: makeShadow() });
  s9.addText(s.t, { x: 0.45, y: 1.17 + i * 0.85, w: 1.8, h: 0.58, fontSize: 11, bold: true, color: WHITE, fontFace: "Cambria", valign: "middle" });
  s9.addShape(pres.shapes.LINE, { x: 2.25, y: 1.22 + i * 0.85, w: 0, h: 0.45, line: { color: WHITE, width: 1 } });
  s9.addText(s.d, { x: 2.4, y: 1.18 + i * 0.85, w: 7.15, h: 0.58, fontSize: 10.5, color: WHITE, fontFace: "Calibri", valign: "middle" });
});
s9.addText("Gamification Service — Diagrama de Clases (Domain, Application, Infrastructure)", { x: 0, y: 5.1, w: 10, h: 0.3, fontSize: 9, color: GRAY, fontFace: "Calibri", align: "center" });
s9.addNotes("El modelo de dominio es rico: 3 aggregates, 7 entidades, 11 VOs. La arquitectura hexagonal garantiza que toda esta lógica es independiente de la infraestructura.");

pres.writeFile({ fileName: "D:/ander/Documents/INTERSEMESTRAL/ECIWISE 2/gamification/presentations/07_Clases.pptx" })
  .then(() => console.log("✅ 07_Clases.pptx generado"))
  .catch(e => console.error("❌", e));
