using System;
using MediatR;
using Gamification.Domain.Enums;

namespace Gamification.Application.Commands
{
    /// <summary>Registra una actividad recurrente que otorga puntos cada vez (quiz, estudio…).</summary>
    public class RegisterActivityCommand : IRequest<ActionRewardResult>
    {
        public Guid UserId { get; set; }
        public ActionType ActionType { get; set; }
        public int Points { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
