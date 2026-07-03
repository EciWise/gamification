using System;
using MediatR;

namespace Gamification.Application.Commands
{
    /// <summary>Registra que un usuario jugó un mini-juego (logro único).</summary>
    public class RegisterGamePlayedCommand : IRequest<ActionRewardResult>
    {
        public Guid UserId { get; set; }

        /// <summary>Identificador del juego jugado (solo informativo).</summary>
        public string? GameId { get; set; }
    }
}
