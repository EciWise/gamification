# Guía de Contribución

¡Gracias por tu interés en contribuir a **Gamification Microservice**! Este documento te guiará a través del proceso.

---

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [¿Cómo Contribuir?](#cómo-contribuir)
3. [Proceso de Desarrollo](#proceso-de-desarrollo)
4. [Convenciones de Commits](#convenciones-de-commits)
5. [Estándares de Código](#estándares-de-código)
6. [Pruebas](#pruebas)
7. [Pull Request Process](#pull-request-process)

---

## Código de Conducta

Este proyecto y todos los que participan en él están regidos por nuestro [Código de Conducta](CODE_OF_CONDUCT.md). Al participar, se espera que cumplas con estos estándares.

---

## ¿Cómo Contribuir?

### Reportar Bugs

Antes de crear un reporte de bug, revisa la [lista de issues](https://github.com/EciWise/gamification/issues) ya que el problema podría haber sido reportado.

Cuando crees un reporte de bug, incluye:
- **Título claro y descriptivo**
- **Descripción exacta del comportamiento observado**
- **Descripción del comportamiento esperado**
- **Pasos específicos para reproducir el problema**
- **Ejemplos específicos para demostrar los pasos**
- **.NET version, SO y versión**
- **Logs relevantes o stacktraces**

### Solicitar Features

Para sugerir una mejora o nueva característica:
- Usa un **título claro y descriptivo**
- Proporciona una **descripción detallada** de la funcionalidad sugerida
- **Lista ejemplos específicos** para mostrar cómo funcionaría
- **Describe el caso de uso** y por qué es útil

### Mejorar Documentación

La documentación siempre puede mejorar. Puedes:
- Corregir errores de ortografía
- Clarificar secciones confusas
- Agregar ejemplos faltantes
- Traducir documentación

---

## Proceso de Desarrollo

### 1. Fork el Repositorio

```bash
git clone https://github.com/your-username/gamification.git
cd gamification
git remote add upstream https://github.com/EciWise/gamification.git
```

### 2. Crear Rama de Feature

```bash
# Actualiza desde el upstream
git fetch upstream
git checkout -b feature/nombre-descriptivo upstream/develop

# Ejemplos válidos:
# feature/jwt-validation
# fix/idempotency-check
# docs/api-documentation
# refactor/domain-service
```

### 3. Realizar Cambios

- Escribe código limpio y legible
- Sigue los [Estándares de Código](#estándares-de-código)
- Agrega tests para nueva funcionalidad
- Actualiza documentación según sea necesario

### 4. Ejecutar Tests Localmente

```bash
# Compilar
dotnet build

# Ejecutar tests
dotnet test

# Ejecutar tests específicos
dotnet test tests/Gamification.Domain.Tests

# Tests con cobertura
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

### 5. Commit de Cambios

Sigue las [Convenciones de Commits](#convenciones-de-commits)

```bash
git add .
git commit -m "feat(security): add JWT validation"
```

### 6. Push y Pull Request

```bash
git push origin feature/nombre-descriptivo
```

Luego abre un Pull Request en GitHub siguiendo la [Plantilla de PR](#pull-request-process)

---

## Convenciones de Commits

Usamos **Conventional Commits** para mantener un historial limpio y permitir changelog automático.

### Formato

```
type(scope): subject

body

footer
```

### Tipos Válidos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios que no afectan la lógica (formato, espacios en blanco)
- **refactor**: Refactorización de código sin cambiar comportamiento
- **perf**: Mejoras de rendimiento
- **test**: Agregar o actualizar tests
- **chore**: Cambios en build, dependencias, etc.
- **ci**: Cambios en configuración de CI/CD
- **security**: Mejoras de seguridad

### Ejemplos

```bash
# Feature
git commit -m "feat(domain): add achievement strategy pattern"

# Bug fix
git commit -m "fix(messaging): handle null JWT token correctly"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(application): simplify command handler"

# Con descripción detallada
git commit -m "feat(cache): implement Redis ranking cache

- Add IRankingCache interface and RedisRankingCache adapter
- Configure Redis connection in appsettings
- Implement cache-aside pattern for rankings
- Add 10-minute TTL for cached entries

Fixes #123"
```

---

## Estándares de Código

### C# / .NET Estándares

- Usa **PascalCase** para nombres de clases, métodos, propiedades públicas
- Usa **camelCase** para variables locales y parámetros
- Usa **_camelCase** para campos privados
- **No** abrevaes nombres (excepto variables de iteración)

```csharp
// ✅ Correcto
public class UserGamification
{
    private readonly IUserGamificationRepository _repository;
    
    public async Task AddPointsAsync(PointTransaction transaction)
    {
        var currentPoints = this._repository.GetPoints();
        // ...
    }
}

// ❌ Incorrecto
public class UserGamif
{
    private IUserGamificationRepository repo;
    
    public async Task AddPts(PtTransaction txn)
    {
        var pts = repo.GetPts();
        // ...
    }
}
```

### Arquitectura Hexagonal

- **Domain** (núcleo): Sin dependencias externas
- **Application**: Orquesta el Domain, usa MediatR
- **Infrastructure**: Implementa puertos del Domain
- **Api**: Punto de entrada HTTP

```csharp
// ✅ Domain (sin dependencias)
public class UserGamification : AggregateRoot
{
    public void AddPoints(PointTransaction transaction)
    {
        // Lógica pura de negocio
    }
}

// ✅ Application (usa Domain)
public class AssignPointsCommandHandler : IRequestHandler<AssignPointsCommand, bool>
{
    public async Task<bool> Handle(AssignPointsCommand request, CancellationToken ct)
    {
        var user = await _userRepository.GetByUserIdAsync(request.UserId);
        user.AddPoints(new PointTransaction(...));
    }
}

// ✅ Infrastructure (implementa puertos)
public class UserGamificationRepository : IUserGamificationRepository
{
    public async Task<UserGamification> GetByUserIdAsync(UserId userId)
    {
        // EF Core queries
    }
}

// ❌ Evita: Domain conociendo Infrastructure
public class UserGamification
{
    private readonly PostgresDbContext _db; // ❌ NO!
}
```

### Naming Conventions

```csharp
// Interfaces
public interface IUserGamificationRepository { }
public interface IJwtValidator { }

// Enums
public enum ActionType
{
    TutoriaCompletada,
    TutoriaDictada,
    MaterialAprobado
}

// Value Objects (Inmutables)
public class Points : ValueObject
{
    public int Value { get; }
}

// Aggregates
public class UserGamification : AggregateRoot
{
}

// Domain Services
public class GamificationDomainService
{
}
```

### Comentarios y Documentación

- **No** comentes código obvio
- **Sí** comenta lógica compleja o **por qué** (no **qué**)
- Usa XML documentation para métodos públicos

```csharp
// ❌ Innecesario
var x = points + 10; // Sumar 10 puntos

// ✅ Útil
// Strategy Pattern: cada logro tiene su propia evaluación
// para permitir fácil extensión sin modificar Domain
public interface IAchievementStrategy
{
    /// <summary>
    /// Determina si el usuario cumple criterios para desbloquear logro.
    /// </summary>
    /// <remarks>
    /// La evaluación es stateless y se ejecuta en el contexto del usuario actual.
    /// Los criterios se cargan desde CriteriaConfig (patrón Template Method).
    /// </remarks>
    bool Evaluate(UserGamification user, List<UserActionStat> stats, 
                  CriteriaConfig config, AchievementContext context);
}
```

---

## Pruebas

### Requisitos

- **Mínimo 80%** cobertura en Domain
- **Mínimo 70%** cobertura en Application
- Los tests deben ser **independientes** y **rápidos**

### Estructura de Tests

```csharp
// ✅ Nombres claros
public class UserGamificationTests
{
    [Fact]
    public void AddPoints_WhenCalled_IncrementsTotalPoints()
    {
        // Arrange
        var user = new UserGamification(userId: Guid.NewGuid());
        var transaction = new PointTransaction(points: 10, ...);

        // Act
        user.AddPoints(transaction);

        // Assert
        Assert.Equal(10, user.TotalPoints.Value);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    public void AddPoints_WithNegativeOrZeroPoints_ThrowsException(int points)
    {
        // Arrange
        var user = new UserGamification(userId: Guid.NewGuid());
        var transaction = new PointTransaction(points: points, ...);

        // Act & Assert
        Assert.Throws<ArgumentException>(() => user.AddPoints(transaction));
    }
}
```

### Ejecutar Tests

```bash
# Todos
dotnet test

# Específico
dotnet test --filter "UserGamificationTests"

# Con salida detallada
dotnet test --verbosity detailed

# Con cobertura
dotnet test /p:CollectCoverage=true
```

---

## Pull Request Process

### Antes de Enviar

1. ✅ Actualiza tu rama desde `upstream/develop`
2. ✅ Todos los tests pasan (`dotnet test`)
3. ✅ Código sigue estándares (usa analyzers)
4. ✅ Documentación actualizada
5. ✅ Commits usan Conventional Commits

### Crear PR

1. Usa el template de PR (se generará automáticamente)
2. Llena todas las secciones requeridas:
   - **Descripción**: Qué cambios y por qué
   - **Tipo de Cambio**: feat/fix/docs/refactor
   - **Testing**: Cómo probaste los cambios
   - **Checklist**: Asegúrate de marcar todos los items

### Ejemplo

```markdown
## Descripción
Agrega validación de JWT en RabbitMqConsumer para rechazar eventos no autenticados.

## Tipo de Cambio
- [x] Nueva funcionalidad (feat)
- [ ] Corrección de bug (fix)
- [ ] Cambio que rompe compatibilidad (BREAKING)

## Testing
- [x] Tests unitarios agregados (JwtValidator)
- [x] Tests de integración (RabbitMqConsumer)
- [x] Ejecutado manualmente en ambiente local

## Checklist
- [x] Mi código sigue los estándares del proyecto
- [x] He actualizado la documentación relevante
- [x] He agregado tests para nueva funcionalidad
- [x] Los tests pasan localmente
- [x] He seguido Conventional Commits
```

### Revisión

- Mantén una mentalidad abierta a sugerencias
- Responde preguntas y comentarios profesionalmente
- Haz cambios solicitados en nuevos commits
- Después de aprobación, mantén un proyecto limpio

---

## Preguntas

- **Issues & Bugs**: [GitHub Issues](https://github.com/EciWise/gamification/issues)
- **Discussions**: [GitHub Discussions](https://github.com/EciWise/gamification/discussions)
- **Security**: [SECURITY.md](SECURITY.md)

---

**¡Gracias por contribuir!** 🚀
