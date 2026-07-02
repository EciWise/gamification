using System;
using MediatR;

namespace Gamification.Application.Commands
{
    /// <summary>
    /// Registra que un usuario abrió una pregunta del Centro de Ayuda. Desbloquea
    /// el logro "Perdidasss, andamos perdidasss!" la primera vez, sin otorgar
    /// puntos. Es idempotente: solo recompensa la primera vez.
    /// </summary>
    public class RegisterHelpQuestionOpenedCommand : IRequest<ActionRewardResult>
    {
        public Guid UserId { get; set; }
    }
}
