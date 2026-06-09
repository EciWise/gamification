# Gamification Microservice

Este es un microservicio encargado de gestionar toda la lógica de **Gamificación** (ej. asignación de puntos, niveles, logros, misiones) basado en las acciones del usuario. 

La aplicación recibe eventos de un frontend desacoplado mediante una cola de mensajes en **RabbitMQ**, procesa las reglas de negocio correspondientes, y persiste los datos.

## 🏗️ Arquitectura

El proyecto está diseñado usando **Arquitectura Limpia / Hexagonal (Ports & Adapters)** para mantener el diseño flexible y las reglas de negocio aisladas de cualquier dependencia externa o framework.

### Estructura de Proyectos

* **`src/Gamification.Domain`:** Entidades base de gamificación (Usuario, Recompensas, Niveles) y reglas puras del negocio. (Sin dependencias externas).
* **`src/Gamification.Application`:** Orquestación (Casos de Uso) y definición de interfaces (Puertos).
* **`src/Gamification.Infrastructure`:** (Adaptador) Implementaciones de persistencia de datos (ej. Base de Datos / Entity Framework).
* **`src/Gamification.Messaging`:** (Adaptador) Consumo y publicación de eventos hacia RabbitMQ para integración asíncrona.
* **`src/Gamification.Api`:** (Punto de entrada) Host HTTP principal, inyección de dependencias (DI) y controladores/puntos finales para interactuar con otras aplicaciones.

## 🚀 Requisitos Previos

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) instalado.
- Una instancia de **RabbitMQ** en ejecución (se recomienda vía Docker).
- Opcional: Entorno local para base de datos (según se implemente en Infrastructure).

## ⚙️ Configuración y Ejecución

1. **Variables de Entorno:** 
   Crea un archivo `.env` en la raíz de la solución y ajusta tus credenciales de RabbitMQ (y cualquier otra de DB que añadas próximamente):
   ```env
   RABBITMQ_HOST=localhost
   RABBITMQ_USER=guest
   RABBITMQ_PASS=guest
   ```

2. **Restaurar las dependencias e instalar:**
   ```bash
   dotnet restore
   dotnet build
   ```

3. **Ejecutar el proyecto principal:**
   ```bash
   dotnet run --project src/Gamification.Api/Gamification.Api.csproj
   ```

## 🧪 Pruebas (Tests)

El marco de trabajo incluye proyectos separados para pruebas funcionales (`xUnit`).

```bash
dotnet test
```

## 🛠️ Tecnologías
- **Platform:** C# / .NET 10
- **Message Broker:** RabbitMQ
- **Test Framework:** xUnit / Moq
