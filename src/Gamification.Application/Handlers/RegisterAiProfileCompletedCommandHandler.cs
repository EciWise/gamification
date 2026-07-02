using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Gamification.Application.Commands;
using Gamification.Domain.Enums;
using Gamification.Domain.Repositories;
using Gamification.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace Gamification.Application.Handlers
{
    /// <summary>
    /// Otorga 10 puntos y (vía evaluación de logros) desbloquea "La IA ya sabe
    /// dónde vives" la primera vez que un usuario completa su perfil de IA.
    /// Reutiliza <see cref="AssignPointsCommand"/> para puntos, subida de nivel y
    /// logros; aquí solo aplicamos la regla de "una sola vez".
    /// </summary>
    public class RegisterAiProfileCompletedCommandHandler : IRequestHandler<RegisterAiProfileCompletedCommand, ActionRewardResult>
    {
        /// <summary>Recompensa única por completar el perfil de IA.</summary>
        private const int AiProfilePoints = 10;

        private readonly IUserGamificationRepository _userGamificationRepository;
        private readonly IMediator _mediator;
        private readonly ILogger<RegisterAiProfileCompletedCommandHandler> _logger;

        public RegisterAiProfileCompletedCommandHandler(
            IUserGamificationRepository userGamificationRepository,
            IMediator mediator,
            ILogger<RegisterAiProfileCompletedCommandHandler> logger)
        {
            _userGamificationRepository = userGamificationRepository ?? throw new ArgumentNullException(nameof(userGamificationRepository));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ActionRewardResult> Handle(RegisterAiProfileCompletedCommand request, CancellationToken cancellationToken)
        {
            var userId = new UserId(request.UserId);
            var userGamification = await _userGamificationRepository.GetByUserIdAsync(userId);

            // Regla de "una sola vez": si el usuario ya completó su perfil de IA
            // antes, no volvemos a otorgar puntos ni reevaluar el logro.
            if (userGamification != null && userGamification.GetStat(ActionType.PerfilIACompletado) >= 1)
            {
                _logger.LogInformation("Usuario {UserId} ya había completado su perfil de IA; sin recompensa.", request.UserId);
                return new ActionRewardResult { Rewarded = false };
            }

            // Delegamos en AssignPointsCommand: suma puntos, incrementa el stat
            // PerfilIACompletado (=> AI_PROFILE_COMPLETED) y desbloquea el logro.
            var result = await _mediator.Send(new AssignPointsCommand
            {
                UserId = request.UserId,
                Points = AiProfilePoints,
                ActionType = ActionType.PerfilIACompletado,
                SourceEventId = Guid.NewGuid(),
                Description = "Perfil de IA completado"
            }, cancellationToken);

            _logger.LogInformation("Usuario {UserId} recibió {Points} puntos por completar su perfil de IA.", request.UserId, AiProfilePoints);
            return new ActionRewardResult { Rewarded = true, UnlockedAchievements = result.UnlockedAchievements };
        }
    }
}
