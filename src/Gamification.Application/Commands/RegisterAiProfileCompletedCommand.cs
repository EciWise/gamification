using System;
using MediatR;

namespace Gamification.Application.Commands
{
    /// <summary>Registra que un usuario completó su perfil de IA (recompensa única).</summary>
    public class RegisterAiProfileCompletedCommand : IRequest<ActionRewardResult>
    {
        public Guid UserId { get; set; }
    }
}
