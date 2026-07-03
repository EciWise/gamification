using System;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Logging;

namespace Gamification.Infrastructure.Security;

/// <summary>
/// Adapter: Implementa IJwtValidator con HMAC (clave simétrica).
/// Valida la firma del JWT usando una clave secreta compartida.
/// </summary>
public class JwtValidator : IJwtValidator
{
    private readonly string _secretKey;
    private readonly string? _issuer;
    private readonly string? _audience;
    private readonly ILogger<JwtValidator>? _logger;

    public JwtValidator(string secretKey, string? issuer = null, string? audience = null, ILogger<JwtValidator>? logger = null)
    {
        if (string.IsNullOrWhiteSpace(secretKey))
            throw new ArgumentException("Secret key cannot be null or empty.", nameof(secretKey));

        _secretKey = secretKey;
        _issuer = issuer;
        _audience = audience;
        _logger = logger;
    }

    /// <summary>
    /// Valida el JWT y extrae los claims.
    /// - Verifica la firma usando HMAC-SHA256.
    /// - Verifica que el token no haya expirado.
    /// - Opcionalmente verifica issuer y audience.
    /// </summary>
    public bool ValidateToken(string token, out ClaimsPrincipal principal)
    {
        principal = null!;

        if (string.IsNullOrWhiteSpace(token))
        {
            _logger?.LogWarning("JWT token is null or empty.");
            return false;
        }

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey)),

                ValidateIssuer = !string.IsNullOrWhiteSpace(_issuer),
                ValidIssuer = _issuer,

                ValidateAudience = !string.IsNullOrWhiteSpace(_audience),
                ValidAudience = _audience,

                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero, // No tolerance for expiration
            };

            // ValidateToken requires a SecurityToken out parameter
            principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            _logger?.LogInformation("JWT token validated successfully. Subject: {Subject}", principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown");
            return true;
        }
        catch (SecurityTokenExpiredException ex)
        {
            _logger?.LogWarning(ex, "JWT token has expired.");
            return false;
        }
        catch (SecurityTokenInvalidSignatureException ex)
        {
            _logger?.LogWarning(ex, "JWT token signature is invalid.");
            return false;
        }
        catch (SecurityTokenException ex)
        {
            _logger?.LogWarning(ex, "JWT token validation failed.");
            return false;
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Unexpected error while validating JWT token.");
            return false;
        }
    }
}

