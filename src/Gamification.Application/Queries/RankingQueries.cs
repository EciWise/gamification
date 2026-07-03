using System;
using System.Collections.Generic;
using MediatR;
using Gamification.Domain.Enums;

namespace Gamification.Application.Queries
{
    public class GetUserRankingQuery : IRequest<UserRankingDto?>
    {
        public Guid UserId { get; set; }
        public RankingType Type { get; set; }
    }

    public class UserRankingDto
    {
        public Guid UserId { get; set; }
        public int Position { get; set; }
        public decimal Score { get; set; }
    }

    public class GetUserAchievementsQuery : IRequest<List<AchievementDto>>
    {
        public Guid UserId { get; set; }
    }

    public class AchievementDto
    {
        public Guid Id { get; set; }
        /// <summary>Clave estable de la estrategia (p. ej. "FIRST_GAME"); el front la usa para el icono/color del toast.</summary>
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime UnlockedAt { get; set; }
    }

    public class GetUserSummaryQuery : IRequest<UserSummaryDto?>
    {
        public Guid UserId { get; set; }
    }

    public class UserSummaryDto
    {
        public Guid UserId { get; set; }
        public int TotalPoints { get; set; }
        public string LevelName { get; set; } = string.Empty;
        public decimal ReputationScore { get; set; }

        /// <summary>Puntos mínimos del nivel actual (base de la barra de progreso).</summary>
        public int CurrentLevelMinPoints { get; set; }
        /// <summary>Nombre del siguiente nivel; null si ya es el máximo.</summary>
        public string? NextLevelName { get; set; }
        /// <summary>Puntos necesarios para el siguiente nivel; null si es el máximo.</summary>
        public int? NextLevelMinPoints { get; set; }
    }

    public class GetLevelsQuery : IRequest<List<LevelDto>>
    {
    }

    public class LevelDto
    {
        public string Name { get; set; } = string.Empty;
        public int MinPoints { get; set; }
    }
}
