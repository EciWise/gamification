using System;
using MediatR;
using Gamification.Domain.Enums;

namespace Gamification.Application.Commands
{
    /// <summary>
    /// Registra una actividad recurrente del usuario (completar un quiz de
    /// práctica, terminar una sesión de estudio…). A diferencia del juego, otorga
    /// puntos CADA vez e incrementa el stat correspondiente, lo que permite
    /// desbloquear logros por repetición (p. ej. "10 quizzes"). Los puntos y el
    /// ActionType los fija el servidor (el controlador), nunca el cliente.
    /// </summary>
    public class RegisterActivityCommand : IRequest<ActionRewardResult>
    {
        public Guid UserId { get; set; }
        public ActionType ActionType { get; set; }
        public int Points { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
