using System;
using MediatR;

namespace Gamification.Application.Commands
{
    /// <summary>Registra que un usuario confirmó y bloqueó sus carreras (recompensa única).</summary>
    public class RegisterCareersCompletedCommand : IRequest<ActionRewardResult>
    {
        public Guid UserId { get; set; }
    }
}
