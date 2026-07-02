using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Gamification.Application.Commands;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Repositories;
using Gamification.Domain.ValueObjects;
using Gamification.Domain.Entities;
using Gamification.Domain.Services;
using Gamification.Application.Queries;
using Microsoft.Extensions.Logging;

namespace Gamification.Application.Handlers
{
    public class AssignPointsCommandHandler : IRequestHandler<AssignPointsCommand, AssignPointsResult>
    {
        private readonly IUserGamificationRepository _userGamificationRepository;
        private readonly IAchievementDefinitionRepository _achievementDefinitionRepository;
        private readonly IUserAchievementRepository _userAchievementRepository;
        private readonly GamificationDomainService _domainService;
        private readonly ILogger<AssignPointsCommandHandler> _logger;

        public AssignPointsCommandHandler(
            IUserGamificationRepository userGamificationRepository,
            IAchievementDefinitionRepository achievementDefinitionRepository,
            IUserAchievementRepository userAchievementRepository,
            GamificationDomainService domainService,
            ILogger<AssignPointsCommandHandler> logger)
        {
            _userGamificationRepository = userGamificationRepository ?? throw new ArgumentNullException(nameof(userGamificationRepository));
            _achievementDefinitionRepository = achievementDefinitionRepository ?? throw new ArgumentNullException(nameof(achievementDefinitionRepository));
            _userAchievementRepository = userAchievementRepository ?? throw new ArgumentNullException(nameof(userAchievementRepository));
            _domainService = domainService ?? throw new ArgumentNullException(nameof(domainService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<AssignPointsResult> Handle(AssignPointsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var unlocked = new List<AchievementDto>();
                var userId = new UserId(request.UserId);
                var levels = await _userGamificationRepository.GetLevelsOrderedAsync();

                var userGamification = await _userGamificationRepository.GetByUserIdAsync(userId);
                if (userGamification == null)
                {
                    // Provisión perezosa: el usuario aún no existe en gamificación.
                    var initialLevel = levels.FirstOrDefault();
                    if (initialLevel == null)
                    {
                        _logger.LogError("No hay niveles definidos; no se puede provisionar al usuario {UserId}.", request.UserId);
                        return AssignPointsResult.Failed();
                    }
                    userGamification = new UserGamification(userId, initialLevel);
                    _logger.LogInformation("Usuario {UserId} provisionado en gamificación (nivel {Level}).", request.UserId, initialLevel.Name);
                }

                var points = new Points(request.Points);
                var description = new EventDescription(request.Description);
                var idempotencyKey = new IdempotencyKey($"{request.SourceEventId}-{request.ActionType}");

                var transaction = new PointTransaction(
                    Guid.NewGuid(),
                    userId,
                    points,
                    request.ActionType,
                    description,
                    request.SourceEventId,
                    idempotencyKey,
                    DateTime.UtcNow
                );

                userGamification.AddPoints(transaction);
                userGamification.IncrementStat(request.ActionType, 1);

                // Detección de subida de nivel: el nivel más alto cuyo umbral de
                // puntos ya alcanzó el usuario. Emite LevelUpEvent si cambió.
                var nivelAlcanzado = levels
                    .Where(l => l.MinPoints.Value <= userGamification.TotalPoints.Value)
                    .OrderByDescending(l => l.MinPoints.Value)
                    .FirstOrDefault();
                if (nivelAlcanzado != null)
                {
                    userGamification.PromoteTo(nivelAlcanzado);
                }

                // Evaluación de logros: corre las estrategias sobre las definiciones
                // activas que el usuario aún no tiene desbloqueadas. Cada logro nuevo
                // emite AchievementUnlockedEvent (→ notificación) y se persiste.
                var definitions = await _achievementDefinitionRepository.GetAllActiveAsync();
                var yaDesbloqueados = await _userAchievementRepository.GetByUserIdAsync(userId);
                var idsDesbloqueados = yaDesbloqueados
                    .Select(a => a.Achievement.Id)
                    .ToHashSet();
                var candidatas = definitions
                    .Where(d => !idsDesbloqueados.Contains(d.Id))
                    .ToList();

                if (candidatas.Count > 0)
                {
                    var context = new AchievementContext(request.SourceEventId, DateTime.UtcNow);
                    var nuevos = _domainService.EvaluateAchievements(
                        userGamification,
                        userGamification.ActionStats.ToList(),
                        candidatas,
                        context);
                    if (nuevos.Count > 0)
                    {
                        _userAchievementRepository.AddRange(nuevos);
                        _logger.LogInformation("Usuario {UserId} desbloqueó {Count} logro(s).", request.UserId, nuevos.Count);
                        unlocked.AddRange(nuevos.Select(ua => new AchievementDto
                        {
                            Id = ua.Achievement.Id,
                            Code = ua.Achievement.StrategyKey,
                            Name = ua.Achievement.Name,
                            Description = ua.Achievement.Description,
                            ImageUrl = ua.Achievement.ImageUrl,
                            UnlockedAt = ua.UnlockedAt
                        }));
                    }
                }

                // Los eventos de dominio (PointsAddedEvent, LevelUpEvent,
                // AchievementUnlockedEvent) se vuelcan al outbox en SaveChangesAsync
                // para su publicación asíncrona.
                await _userGamificationRepository.SaveAsync(userGamification);

                _logger.LogInformation("Successfully assigned {Points} points to User {UserId} for {ActionType}", request.Points, request.UserId, request.ActionType);

                return new AssignPointsResult { Success = true, UnlockedAchievements = unlocked };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning points to user {UserId}", request.UserId);
                throw;
            }
        }
    }
}
