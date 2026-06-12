# Gamification Service Documentation

Este documento proporciona una explicación exhaustiva de la arquitectura, diseño y funcionamiento del microservicio de Gamificación.

---

## 1. Contexto y Arquitectura

El microservicio de Gamificación es el encargado de gestionar el sistema de puntos, insignias (achievements), niveles y rankings dentro de la plataforma educativa.

### Arquitectura Hexagonal (Puertos y Adaptadores)
Hemos seguido estrictamente la **Arquitectura Hexagonal**, lo que garantiza una separación clara entre la lógica de negocio y las dependencias externas.

*   **Domain (Capa Central)**: Contiene la lógica pura de negocio, entidades, agregados, eventos de dominio y servicios de dominio. No tiene dependencias de otras capas.
*   **Application (Casos de Uso)**: Orquestra el flujo de la aplicación. Utiliza **MediatR** para implementar los patrones **CQRS** (Command Query Responsibility Segregation).
*   **Infrastructure (Adaptadores de Salida)**: Implementaciones concretas de persistencia (PostgreSQL), mensajería (RabbitMQ) y caché (Redis).
*   **Api (Adaptadores de Entrada)**: Controladores REST que exponen los puertos hacia el exterior.

### CQRS (Separación de Comandos y Consultas)
*   **Commands**: Acciones que mutan el estado (ej. `AssignPointsCommand`).
*   **Queries**: Consultas que leen datos (ej. `GetUserRankingQuery`).

---

## 2. Catálogo de Clases y Objetos

### Agregados (Aggregates)
1.  **`UserGamification`**: El agregado raíz principal. Representa el estado gamificado de un usuario (puntos totales, nivel actual, estadísticas de acciones).
2.  **`AchievementDefinition`**: Define los requisitos y la lógica para desbloquear una insignia.
3.  **`Ranking`**: Representa una clasificación calculada para un periodo determinado y un tipo específico.

### Entidades (Entities)
*   **`PointTransaction`**: Registro inmutable de una ganancia de puntos.
*   **`UserAchievement`**: Relación entre un usuario y una insignia desbloqueada.
*   **`LevelDefinition`**: Umbrales de puntos para los niveles.
*   **`GamificationRule`**: Reglas configurables que definen cuántos puntos da cada acción.
*   **`WeeklyActivity`**: Acumulado semanal de actividad.

### Objetos de Valor (Value Objects)
*   **`Points`**, **`UserId`**, **`IdempotencyKey`**, **`ReputationScore`**, **`CriteriaConfig`**, **`DateRange`**, **`UserActionStat`**.

---

## 3. Patrones de Diseño Implementados

### 3.1. Outbox Pattern
Para garantizar la consistencia eventual entre la base de datos y RabbitMQ, utilizamos una tabla `outbox`.
*   Cuando el dominio genera un evento, este se guarda en la tabla `outbox` dentro de la misma transacción de la base de datos.
*   **`OutboxWorker`**: Un servicio en segundo plano lee periódicamente esta tabla y publica los mensajes en RabbitMQ.

### 3.2. Idempotent Consumer
Para evitar procesar dos veces el mismo mensaje de RabbitMQ:
*   Cada mensaje tiene un `eventId` único.
*   **`RabbitMqConsumer`** verifica en la tabla `processed_events` si el ID ya fue procesado antes de ejecutar el handler.

### 3.3. Strategy Pattern (Achievements)
La lógica de desbloqueo de insignias es variada. Hemos implementado el patrón **Strategy**:
*   `IAchievementStrategy`: Interfaz común.
*   Implementaciones: `FirstTutoringStrategy`, `ActiveCollaboratorStrategy`, `OutstandingTutorStrategy`, `MentorOfMonthStrategy`.
*   `AchievementStrategyFactory`: Encargado de instanciar la estrategia correcta según la insignia evaluada.

### 3.4. Repository Pattern
Las interfaces se definen en el dominio (`IUserGamificationRepository`) y se implementan en infraestructura con EF Core.

---

## 4. Integración con RabbitMQ (Event-Driven)

El microservicio está suscrito a los siguientes eventos externos:

| Evento | Datos recibidos | Acción |
| :--- | :--- | :--- |
| `LessonCompleted` | `userId`, `eventId`, `lessonId` | Otorga puntos por completar tutoría y actualiza estadísticas. |
| `UserCreated` | `userId`, `displayName`, `avatarUrl` | Inicializa el perfil gamificado del usuario en el sistema. |
| `TutoringRated` | `tutorId`, `rating` | Actualiza el ranking de tutores y evalúa logros de reputación. |
| `MaterialUploadApproved`| `userId`, `materialId` | Otorga puntos y suma a la estadística de "Colaborador Activo". |

---

## 5. Persistencia y Optimización de Base de Datos

*   **PostgreSQL**: Base de datos relacional robusta.
    *   Uso de tipos **JSONB** para `CriteriaConfig`, permitiendo reglas de logros flexibles sin cambiar el esquema.
    *   Índices en `user_id` y `occurred_at` para consultas rápidas de historial.
*   **Redis**: Utilizado como **Caché de Rankings**.
    *   Las consultas de los Top 100 se sirven desde Redis para máxima velocidad.
    *   **`RankingJob`**: Actualiza los rankings en la base de datos periódicamente, e invalida la caché de Redis.

---

## 6. Flujos de Usuario Principales

1.  **Ganar Puntos**: Un servicio externo publica `LessonCompleted` -> RabbitMQ -> `RabbitMqConsumer` -> `AssignPointsCommand` -> `UserGamification.AddPoints()` -> Save to DB & Outbox.
2.  **Desbloquear Insignia**: Al ganar puntos o actualizar estadísticas, se invocan las `IAchievementStrategy` -> Si se cumple -> `UserGamification.UnlockAchievement()`.
3.  **Ver Ranking**: API GET `/api/Gamification/users/{id}/ranking` -> Consulta Redis -> Si no está, consulta DB -> Devuelve posición y score.

---

## 7. Madurez de la API (Richardson Maturity Model)

Nuestra API se encuentra entre el **Nivel 2 y 3**:
*   **Nivel 1 (Resources)**: URIs claras como `/users/{id}/ranking`.
*   **Nivel 2 (Verbs)**: Uso correcto de GET, POST, PUT, DELETE y códigos de estado HTTP (200, 201, 404, 500).
*   **Nivel 3 (HATEOAS)**: Las respuestas incluyen metadatos y documentación autogenerada vía Swagger para navegación.

---

## 8. Seguridad y Eficiencia

*   **Idempotencia**: Protege contra fallos de red en el bus de mensajes.
*   **Transaccionalidad**: El uso del Outbox garantiza que nunca perderemos un evento de integración si la base de datos se actualizó.
*   **Inyección de Dependencias**: Todo el sistema está desacoplado mediante DI de .NET.
*   **Documentación OpenAPI**: Disponible en `/swagger` para facilitar la integración de otros equipos.
