using System.Security.Claims;

namespace Gamification.Infrastructure.Security;

/// <summary>
/// Port: Define el contrato para validación de JWT.
/// Implementado en JwtValidator (Adapter).
/// </summary>
public interface IJwtValidator
{
    /// <summary>
    /// Valida un token JWT y extrae sus claims.
    /// </summary>
    /// <param name="token">El token JWT a validar.</param>
    /// <param name="principal">Los claims del token (salida).</param>
    /// <returns>true si el token es válido; false en caso contrario.</returns>
    bool ValidateToken(string token, out ClaimsPrincipal principal);
}
