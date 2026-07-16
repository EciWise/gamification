using System;
using MediatR;

namespace Gamification.Application.Commands
{
    /// <summary>Registra que un usuario completó la información de su carrera (logro único).</summary>
    public class RegisterCareerInfoCompletedCommand : IRequest<ActionRewardResult>
    {
        public Guid UserId { get; set; }
    }
}
