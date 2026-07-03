using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Gamification.Application.Queries;
using Gamification.Domain.Repositories;
using Gamification.Domain.ValueObjects;

namespace Gamification.Application.Handlers
{
    public class RankingQueryHandlers :
        IRequestHandler<GetUserRankingQuery, UserRankingDto?>
    {
        private readonly IRankingRepository _rankingRepository;

        public RankingQueryHandlers(IRankingRepository rankingRepository)
        {
            _rankingRepository = rankingRepository;
        }

        public async Task<UserRankingDto?> Handle(GetUserRankingQuery request, CancellationToken cancellationToken)
        {
            var ranking = await _rankingRepository.GetCurrentAsync(request.Type, null);
            if (ranking == null) return null;

            var entry = ranking.Entries.FirstOrDefault(e => e.UserId.Value == request.UserId);
            if (entry == null) return null;

            return new UserRankingDto
            {
                UserId = entry.UserId.Value,
                Position = entry.Position,
                Score = entry.Score
            };
        }
    }

    /// <summary>Devuelve los logros desbloqueados por el usuario.</summary>
    public class GetUserAchievementsQueryHandler :
        IRequestHandler<GetUserAchievementsQuery, List<AchievementDto>>
    {
        private readonly IUserAchievementRepository _userAchievementRepository;

        public GetUserAchievementsQueryHandler(IUserAchievementRepository userAchievementRepository)
        {
            _userAchievementRepository = userAchievementRepository;
        }

        public async Task<List<AchievementDto>> Handle(GetUserAchievementsQuery request, CancellationToken cancellationToken)
        {
            var achievements = await _userAchievementRepository.GetByUserIdAsync(new UserId(request.UserId));
            return achievements.Select(ua => new AchievementDto
            {
                Id = ua.Achievement.Id,
                Code = ua.Achievement.StrategyKey,
                Name = ua.Achievement.Name,
                Description = ua.Achievement.Description,
                ImageUrl = ua.Achievement.ImageUrl,
                UnlockedAt = ua.UnlockedAt
            }).ToList();
        }
    }

    /// <summary>Resumen de gamificación del usuario: puntos, nivel y reputación.</summary>
    public class GetUserSummaryQueryHandler :
        IRequestHandler<GetUserSummaryQuery, UserSummaryDto?>
    {
        private readonly IUserGamificationRepository _userGamificationRepository;

        public GetUserSummaryQueryHandler(IUserGamificationRepository userGamificationRepository)
        {
            _userGamificationRepository = userGamificationRepository;
        }

        public async Task<UserSummaryDto?> Handle(GetUserSummaryQuery request, CancellationToken cancellationToken)
        {
            var user = await _userGamificationRepository.GetByUserIdAsync(new UserId(request.UserId));
            if (user == null) return null;

            var levels = await _userGamificationRepository.GetLevelsOrderedAsync();
            var points = user.TotalPoints.Value;

            // Nivel actual = el más alto cuyo umbral ya alcanzó; siguiente = el
            // primero con umbral mayor (null si ya es el máximo).
            var currentMin = levels
                .Where(l => l.MinPoints.Value <= points)
                .Select(l => l.MinPoints.Value)
                .DefaultIfEmpty(0)
                .Max();
            var next = levels
                .Where(l => l.MinPoints.Value > points)
                .OrderBy(l => l.MinPoints.Value)
                .FirstOrDefault();

            return new UserSummaryDto
            {
                UserId = user.Id,
                TotalPoints = points,
                LevelName = user.CurrentLevel?.Name ?? "Inicial",
                ReputationScore = user.ReputationScore.Value,
                CurrentLevelMinPoints = currentMin,
                NextLevelName = next?.Name,
                NextLevelMinPoints = next?.MinPoints.Value
            };
        }
    }

    /// <summary>Devuelve la escalera de niveles (para las insignias del front).</summary>
    public class GetLevelsQueryHandler : IRequestHandler<GetLevelsQuery, List<LevelDto>>
    {
        private readonly IUserGamificationRepository _userGamificationRepository;

        public GetLevelsQueryHandler(IUserGamificationRepository userGamificationRepository)
        {
            _userGamificationRepository = userGamificationRepository;
        }

        public async Task<List<LevelDto>> Handle(GetLevelsQuery request, CancellationToken cancellationToken)
        {
            var levels = await _userGamificationRepository.GetLevelsOrderedAsync();
            return levels
                .Select(l => new LevelDto { Name = l.Name, MinPoints = l.MinPoints.Value })
                .ToList();
        }
    }
}
