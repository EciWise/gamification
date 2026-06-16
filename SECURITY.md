# Política de Seguridad

## Reporte de Vulnerabilidades de Seguridad

Si descubres una **vulnerabilidad de seguridad**, por favor **NO** la reportes públicamente en GitHub Issues.

En su lugar, envía un reporte detallado a: **[security@eciwise.edu](mailto:security@eciwise.edu)**

### Qué Incluir en tu Reporte

- **Descripción clara** de la vulnerabilidad
- **Pasos para reproducirla**
- **Impacto potencial** y severidad estimada
- **Versión(es) afectada(s)**
- **Sugerencias de corrección** (si las tienes)

### Nuestro Compromiso

- Reconoceremos tu reporte en **48 horas**
- Trabajaremos para resolver la vulnerabilidad de forma **oportuna**
- Te informaremos sobre el **cronograma de corrección**
- Publicaremos un **advisory de seguridad** una vez que la corrección esté disponible

---

## Prácticas de Seguridad Implementadas

### 🔐 Autenticación y Autorización

#### JWT (JSON Web Tokens)

- **Algoritmo**: HMAC-SHA256 (clave simétrica compartida)
- **Claims Validados**:
  - Firma digital
  - Expiración (sin tolerancia)
  - Issuer (emisor del token)
  - Audience (audiencia prevista)

- **Configuración**:
```env
JWT_SECRET_KEY=your-super-secret-key-min-32-characters-long!!!
JWT_ISSUER=gamification-service
JWT_AUDIENCE=gamification-api
```

#### Validación de Mensajes RabbitMQ

- Todos los eventos deben incluir JWT en header `x-jwt-token`
- Mensajes sin JWT válido son rechazados con `Nack(requeue=false)`
- Validación ocurre **antes** de procesar el evento
- Eventos inválidos se loguean con nivel WARNING

### 🛡️ Protección de Datos

#### Encriptación en Tránsito

- **HTTPS/TLS**: API debe usarse sobre HTTPS en producción
- **RabbitMQ TLS**: Usar conexiones cifradas a RabbitMQ

```csharp
// Recomendado para producción
var factory = new ConnectionFactory
{
    Ssl = new SslOption
    {
        Enabled = true,
        ServerName = hostname
    }
};
```

- **PostgreSQL SSL**: Conectar con `sslmode=require`

#### Encriptación en Reposo

- Sensitive data en PostgreSQL debe encriptarse a nivel de aplicación
- Usar **Azure Key Vault** o **HashiCorp Vault** para secretos

### 🔑 Gestión de Secretos

#### Secretos No Deben:

```csharp
// ❌ NO HACER ESTO
public const string JWT_SECRET = "my-secret-key"; // En código fuente
var password = "postgres_password"; // Hardcoded

// ❌ NO HACER ESTO
// Guardar en .env sin .gitignore
JWT_SECRET_KEY=secret123
```

#### Secretos Deben:

```csharp
// ✅ Usar variables de entorno
var secret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");

// ✅ Usar appsettings.json (no commiteado)
var secret = builder.Configuration["Jwt:SecretKey"];

// ✅ Usar Key Vault en producción
var client = new SecretClient(vaultUri, new DefaultAzureCredential());
var secret = await client.GetSecretAsync("jwt-secret-key");
```

#### .gitignore

```
# Secretos
.env
appsettings.*.json
*.pem
*.key

# Otros
bin/
obj/
.vs/
.DS_Store
```

### 🧪 Validación de Entrada

```csharp
// ✅ Validar entrada en los límites
public class AssignPointsCommand
{
    [Range(1, int.MaxValue, ErrorMessage = "Points must be positive")]
    public int Points { get; set; }

    [Required]
    public Guid UserId { get; set; }
}

// ✅ Null safety y nullability checks
public bool ValidateToken(string token, out ClaimsPrincipal principal)
{
    if (string.IsNullOrWhiteSpace(token))
    {
        _logger?.LogWarning("Token is null or empty");
        return false;
    }
    // ...
}
```

### 🔍 Idempotencia

Previene ataques de **replay attacks** y corrupción de datos:

```csharp
// Cada evento tiene IdempotencyKey única
var idempotencyKey = $"{sourceEventId}-{actionType}";

// Verificar si ya fue procesado
if (await dbContext.ProcessedEvents.AnyAsync(e => e.EventId == idempotencyKey))
{
    _logger.LogWarning("Event {EventId} already processed", idempotencyKey);
    await channel.BasicAckAsync(...); // Ack sin procesar
    return;
}
```

### 📊 Logging y Monitoreo

#### Eventos de Seguridad Se Loguean

```
⚠️ JWT token not found in message headers
⚠️ JWT token has expired
⚠️ JWT token signature is invalid
ℹ️ JWT token validated successfully. Subject: education-service
```

#### Nunca Loguees

```csharp
// ❌ NUNCA
_logger.LogInformation($"JWT Token: {jwtToken}"); // Exposición de secreto
_logger.LogError($"Password: {password}"); // Exposición de credencial

// ✅ BIEN
_logger.LogInformation("JWT token validated successfully");
_logger.LogError("Authentication failed for user {UserId}", userId);
```

#### Monitoreo Recomendado

- Alertas en múltiples intentos de JWT inválido
- Alertas en cambios de reglas de gamificación
- Auditoría de cambios en configuración de seguridad
- Tracking de acceso a datos sensibles

### 🚫 Control de Acceso

#### API Endpoints

- ✅ `GET /api/gamification/users/{userId}/ranking` → Público
- ✅ `GET /api/gamification/users/{userId}/achievements` → Público
- 🔒 `GET /api/admin/rules` → Requiere autenticación admin (futuro)

```csharp
// Ejemplo: Futuro - Agregar autorización
[Authorize(Roles = "Admin")]
[HttpGet("admin/rules")]
public async Task<IActionResult> GetRules()
{
    // ...
}
```

### 🔄 Rotación de Claves (Roadmap)

Futuras mejoras de seguridad:

1. **Múltiples claves JWT activas**
   - `currentKey`: Clave actual
   - `previousKey`: Clave anterior (tolerancia)
   - `keyRotationDate`: Cuándo rotar

2. **Versionado de secretos**
   - Azure Key Vault versioning
   - Automatización de rotación

3. **Auditoría de acceso**
   - Quién accede a qué recurso
   - Cuándo se modificaron secretos

---

## Consideraciones de Seguridad por Entorno

### 🔧 Desarrollo (Local)

```env
JWT_SECRET_KEY=dev-key-only-32-chars-min-required!!
JWT_ISSUER=gamification-service
JWT_AUDIENCE=gamification-api
RABBITMQ_HOST=localhost  # Sin TLS
POSTGRES_SSLMODE=disable
```

- ✅ TLS no obligatorio
- ✅ Autenticación básica RabbitMQ
- ⚠️ Base de datos sin encriptación
- ✅ Logging verbose para debugging

### 🧪 Testing/Staging

```env
JWT_SECRET_KEY=$(openssl rand -base64 32)  # Generado
JWT_ISSUER=gamification-service
JWT_AUDIENCE=gamification-api
RABBITMQ_HOST=rabbitmq.internal
POSTGRES_SSLMODE=require
```

- ✅ TLS obligatorio para RabbitMQ
- ✅ TLS obligatorio para PostgreSQL
- ✅ Secretos en Azure Key Vault
- ✅ Logging estructurado

### 🚀 Producción

```env
# ❌ NUNCA en git
# ✅ Usar Azure Key Vault o similiar
JWT_SECRET_KEY=*** (desde vault)
JWT_ISSUER=gamification-service
JWT_AUDIENCE=gamification-api
```

Checklist de producción:

- [ ] ✅ HTTPS/TLS habilitado
- [ ] ✅ RabbitMQ con TLS + autenticación fuerte
- [ ] ✅ PostgreSQL con TLS + credenciales fuertes
- [ ] ✅ Redis con autenticación
- [ ] ✅ Secrets en Azure Key Vault
- [ ] ✅ Logging centralizado (ELK/Splunk)
- [ ] ✅ Monitoreo de seguridad (SIEM)
- [ ] ✅ Firewall configurado
- [ ] ✅ DDoS protection habilitado
- [ ] ✅ Regular security audits/pen testing

---

## Respuesta a Incidentes de Seguridad

Si se descubre una vulnerabilidad después del deployment:

1. **Inmediatamente**: Aisllar el sistema afectado
2. **Dentro de 1 hora**: Notificar al equipo de seguridad
3. **Dentro de 24 horas**: Implementar parche temporal si es crítico
4. **Dentro de 48 horas**: Implementar corrección permanente
5. **Dentro de 1 semana**: Post-mortem y mejoras preventivas

---

## Recursos de Seguridad

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Microsoft Security Best Practices for .NET](https://docs.microsoft.com/en-us/dotnet/standard/security/)
- [JWT.io - JWT Information](https://jwt.io/)
- [RabbitMQ Security](https://www.rabbitmq.com/security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)

---

## Contacto

- **Security Issues**: [security@eciwise.edu](mailto:security@eciwise.edu)
- **General Support**: [support@eciwise.edu](mailto:support@eciwise.edu)

---

**Última actualización**: Junio 2026
**Próxima revisión**: Diciembre 2026
