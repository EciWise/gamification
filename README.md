# 🎮 Gamification Microservice

[![Build Status](https://github.com/EciWise/gamification/workflows/CI/badge.svg)](https://github.com/EciWise/gamification/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![.NET](https://img.shields.io/badge/.NET-10-blueviolet)](https://dotnet.microsoft.com)
[![Security Policy](https://img.shields.io/badge/Security-Policy-red)](SECURITY.md)

Microservicio robusto y seguro para gestionar gamificación (puntos, logros, rankings) en **EciWise 2**. Implementado con **Arquitectura Hexagonal**, **Domain-Driven Design** y **CQRS**.

---

## ✨ Características

- 🎯 **Gestión de Puntos**: Otorga puntos según acciones del usuario (tutorías, materiales, foros)
- 🏆 **Sistema de Logros**: Desbloquea badges con estrategias configurables
- 📊 **Rankings Dinámicos**: Leaderboards globales, por materia y mensuales con caché en Redis
- 🔐 **Autenticación JWT**: Validación segura de mensajes vía RabbitMQ
- 📨 **Manejado por Eventos**: Procesamiento asincrónico con Patrón Outbox
- 🛡️ **Idempotente**: Garantía de procesamiento exacto una sola vez
- 📈 **Observable**: Logging estructurado con Microsoft.Extensions.Logging
- 🧪 **Testeable**: Capa Domain sin dependencias externas

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│        Gamification.Api (HTTP)              │
│    Controllers • DI • Swagger • Logging     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│     Gamification.Application (CQRS)         │
│   Commands • Queries • Handlers • MediatR   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│       Gamification.Domain (DDD)             │
│  Aggregates • Entities • Value Objects      │
│  Domain Services • Ports • Domain Events    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│    Gamification.Infrastructure (Adapters)   │
│  Repositories • Cache • Messaging • Workers │
└─────────────────────────────────────────────┘
```

**Patrón**: Hexagonal (Ports & Adapters)
**Principios**: DDD, CQRS, Event-Driven, Clean Architecture

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **.NET 10** SDK
- **Docker** & **Docker Compose**
- **PostgreSQL 15** (o vía Docker)
- **RabbitMQ 3.12** (o vía Docker)
- **Redis 7** (o vía Docker)

### Usando Docker Compose (Recomendado)

```bash
# Inicia los servicios de infraestructura
docker compose up -d

# El servicio se conectará a:
# - PostgreSQL: localhost:5432 (gamification_user / Segura123!)
# - Redis: localhost:6379
# - RabbitMQ: localhost:5672 (guest / guest)
#   Management UI: http://localhost:15672
```

### Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/EciWise/gamification.git
cd gamification

# Restaurar dependencias
dotnet restore

# Compilar
dotnet build

# Ejecutar tests
dotnet test

# Iniciar API
dotnet run --project src/Gamification.Api

# API disponible en: http://localhost:5027
# Swagger UI: http://localhost:5027/swagger/index.html
```

---

## 📚 Documentación API

### Endpoints Principales

#### Obtener Ranking del Usuario
```http
GET /api/gamification/users/{userId}/ranking?type=GlobalPorPuntos

Response: 200 OK
{
  "userId": "uuid",
  "position": 1,
  "score": 5200.5
}
```

#### Obtener Logros del Usuario
```http
GET /api/gamification/users/{userId}/achievements

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Primera Tutoría",
    "description": "Dicta tu primera tutoría",
    "imageUrl": "https://...",
    "unlockedAt": "2026-06-16T10:30:00Z"
  }
]
```

Documentación completa disponible en `/swagger/index.html`

---

## 🔐 Seguridad

### Autenticación JWT

Todos los mensajes RabbitMQ deben incluir un JWT válido en el encabezado `x-jwt-token`:

```bash
JWT_SECRET_KEY=your-super-secret-key-min-32-characters-long!!!
JWT_ISSUER=gamification-service
JWT_AUDIENCE=gamification-api
```

Los mensajes sin JWT válido son rechazados con `Nack(requeue=false)`.

**Ver [SECURITY.md](SECURITY.md) para políticas de seguridad detalladas.**

---

## 📁 Estructura del Proyecto

```
gamification/
├── src/
│   ├── Gamification.Api/              # Punto de entrada HTTP
│   ├── Gamification.Application/      # Casos de uso (CQRS)
│   ├── Gamification.Domain/           # Lógica de negocio pura
│   ├── Gamification.Infrastructure/   # Adaptadores
│   └── Gamification.Messaging/        # Contratos de eventos
├── tests/
│   ├── Gamification.Domain.Tests/
│   ├── Gamification.Application.Tests/
│   └── Gamification.Integration.Tests/
├── compose.yaml
├── .env.example
└── Gamification.slnx
```

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
dotnet test

# Ejecutar proyecto específico
dotnet test tests/Gamification.Domain.Tests

# Con cobertura
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

---

## 🤝 Contribución

¡Bienvenidas las contribuciones! Ver [CONTRIBUTING.md](CONTRIBUTING.md) para:
- Código de Conducta
- Configuración de desarrollo
- Convenciones de commits
- Proceso de Pull Requests

---

## 📝 Licencia

Este proyecto está bajo licencia **MIT** - ver archivo [LICENSE](LICENSE)

---

## 🛡️ Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad, **no** crees un issue público.
Sigue nuestra [Política de Seguridad](SECURITY.md) para divulgación responsable.

---

## 🛠️ Tecnologías

- **Plataforma**: C# / .NET 10
- **Base de Datos**: PostgreSQL 15
- **Cache**: Redis 7
- **Message Broker**: RabbitMQ 3.12
- **ORM**: Entity Framework Core
- **CQRS**: MediatR
- **Testing**: xUnit, Moq, FluentAssertions
- **API Docs**: Swagger/Swashbuckle
