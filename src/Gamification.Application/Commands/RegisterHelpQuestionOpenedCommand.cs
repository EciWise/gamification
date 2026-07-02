using System;
using MediatR;

namespace Gamification.Application.Commands
{
    /// <summary>Registra que un usuario abrió una pregunta del Centro de Ayuda (logro único).</summary>
    public class RegisterHelpQuestionOpenedCommand : IRequest<ActionRewardResult>
    {
        public Guid UserId { get; set; }
    }
}
