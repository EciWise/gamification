using System;
using MediatR;

namespace Gamification.Application.Commands
{
    /// <summary>
    /// Registra que un usuario ha jugado un juego, lo que genera un logro.
    /// </summary>
    public class RegisterGamePlayedCommand : IRequest<ActionRewardResult>
    {
        public Guid UserId { get; set; }

        /// <summary>Identificador del juego jugado (p. ej. "serpiente"), solo informativo.Att Daniel</summary>
        public string? GameId { get; set; }
    }
}
