using System;
using System.Collections.Generic;
using MediatR;
using Gamification.Domain.Enums;
using Gamification.Application.Queries;

namespace Gamification.Application.Commands
{
    public class AssignPointsCommand : IRequest<AssignPointsResult>
    {
        public Guid UserId { get; set; }
        public int Points { get; set; }
        public ActionType ActionType { get; set; }
        public string Description { get; set; } = string.Empty;
        public Guid SourceEventId { get; set; }
    }

    /// <summary>
    /// Resultado de asignar puntos: si tuvo éxito y qué logros se desbloquearon
    /// en esa asignación (para que el front pueda mostrar el toast).
    /// </summary>
    public class AssignPointsResult
    {
        public bool Success { get; set; }
        public IReadOnlyList<AchievementDto> UnlockedAchievements { get; set; } = new List<AchievementDto>();

        public static AssignPointsResult Failed() => new AssignPointsResult { Success = false };
    }

    /// <summary>
    /// Resultado de registrar una acción del usuario (juego, práctica, estudio):
    /// si otorgó recompensa esta vez y los logros recién desbloqueados.
    /// </summary>
    public class ActionRewardResult
    {
        public bool Rewarded { get; set; }
        public IReadOnlyList<AchievementDto> UnlockedAchievements { get; set; } = new List<AchievementDto>();
    }
}
