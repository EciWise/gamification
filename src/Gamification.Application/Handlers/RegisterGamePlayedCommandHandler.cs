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
    /// Otorga 10 puntos y (vía evaluación de logros) desbloquea "Buscador de
    /// aventuras" la primera vez que un usuario juega. Reutiliza
    /// <see cref="AssignPointsCommand"/> para toda la lógica de puntos, subida de
    /// nivel y logros; aquí solo aplicamos la regla de "una sola vez".
    /// </summary>
    public class RegisterGamePlayedCommandHandler : IRequestHandler<RegisterGamePlayedCommand, ActionRewardResult>
    {
        /// <summary>Recompensa única por jugar el primer mini-juego.</summary>
        private const int FirstGamePoints = 10;

        private readonly IUserGamificationRepository _userGamificationRepository;
        private readonly IMediator _mediator;
        private readonly ILogger<RegisterGamePlayedCommandHandler> _logger;

        public RegisterGamePlayedCommandHandler(
            IUserGamificationRepository userGamificationRepository,
            IMediator mediator,
            ILogger<RegisterGamePlayedCommandHandler> logger)
        {
            _userGamificationRepository = userGamificationRepository ?? throw new ArgumentNullException(nameof(userGamificationRepository));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ActionRewardResult> Handle(RegisterGamePlayedCommand request, CancellationToken cancellationToken)
        {
            var userId = new UserId(request.UserId);
            var userGamification = await _userGamificationRepository.GetByUserIdAsync(userId);

            // Regla de "una sola vez": si el usuario ya tiene registrada al menos una
            // jugada, no volvemos a otorgar puntos ni reevaluar el logro.
            if (userGamification != null && userGamification.GetStat(ActionType.JuegoJugado) >= 1)
            {
                _logger.LogInformation("Usuario {UserId} ya había jugado antes; sin recompensa.", request.UserId);
                return new ActionRewardResult { Rewarded = false };
            }

            var description = string.IsNullOrWhiteSpace(request.GameId)
                ? "Primer juego jugado"
                : $"Primer juego jugado: {request.GameId}";

            // Delegamos en AssignPointsCommand: suma puntos, incrementa el stat
            // JuegoJugado (=> FIRST_GAME) y desbloquea "Buscador de aventuras".
            var result = await _mediator.Send(new AssignPointsCommand
            {
                UserId = request.UserId,
                Points = FirstGamePoints,
                ActionType = ActionType.JuegoJugado,
                SourceEventId = Guid.NewGuid(),
                Description = description
            }, cancellationToken);

            _logger.LogInformation("Usuario {UserId} recibió {Points} puntos por su primer juego.", request.UserId, FirstGamePoints);
            return new ActionRewardResult { Rewarded = true, UnlockedAchievements = result.UnlockedAchievements };
        }
    }
}
