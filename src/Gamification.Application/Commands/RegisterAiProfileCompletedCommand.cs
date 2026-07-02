using System;
using MediatR;

namespace Gamification.Application.Commands
{
    /// <summary>
    /// Registra que un usuario completó su perfil de IA en la sección de perfil.
    /// Otorga una recompensa única de 10 puntos y desbloquea el logro
    /// "La IA ya sabe dónde vives". Es idempotente: solo recompensa la primera vez.
    /// </summary>
    public class RegisterAiProfileCompletedCommand : IRequest<ActionRewardResult>
    {
        public Guid UserId { get; set; }
    }
}
