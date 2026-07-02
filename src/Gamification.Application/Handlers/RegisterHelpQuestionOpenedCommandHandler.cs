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
    /// Desbloquea "Perdidasss, andamos perdidasss!" (vía evaluación de logros) la
    /// primera vez que un usuario abre una pregunta del Centro de Ayuda. Reutiliza
    /// <see cref="AssignPointsCommand"/> para incrementar el stat y evaluar logros;
    /// no otorga puntos (recompensa puramente simbólica) y aplica la regla de "una
    /// sola vez".
    /// </summary>
    public class RegisterHelpQuestionOpenedCommandHandler : IRequestHandler<RegisterHelpQuestionOpenedCommand, ActionRewardResult>
    {
        /// <summary>Este logro no otorga puntos, solo la insignia.</summary>
        private const int HelpQuestionPoints = 0;

        private readonly IUserGamificationRepository _userGamificationRepository;
        private readonly IMediator _mediator;
        private readonly ILogger<RegisterHelpQuestionOpenedCommandHandler> _logger;

        public RegisterHelpQuestionOpenedCommandHandler(
            IUserGamificationRepository userGamificationRepository,
            IMediator mediator,
            ILogger<RegisterHelpQuestionOpenedCommandHandler> logger)
        {
            _userGamificationRepository = userGamificationRepository ?? throw new ArgumentNullException(nameof(userGamificationRepository));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ActionRewardResult> Handle(RegisterHelpQuestionOpenedCommand request, CancellationToken cancellationToken)
        {
            var userId = new UserId(request.UserId);
            var userGamification = await _userGamificationRepository.GetByUserIdAsync(userId);

            // Regla de "una sola vez": si el usuario ya abrió una pregunta de ayuda
            // antes, no reevaluamos el logro.
            if (userGamification != null && userGamification.GetStat(ActionType.AyudaPreguntaAbierta) >= 1)
            {
                _logger.LogInformation("Usuario {UserId} ya había abierto una pregunta de ayuda; sin recompensa.", request.UserId);
                return new ActionRewardResult { Rewarded = false };
            }

            // Delegamos en AssignPointsCommand: incrementa el stat AyudaPreguntaAbierta
            // (=> HELP_QUESTION_OPENED) y desbloquea el logro. Sin puntos.
            var result = await _mediator.Send(new AssignPointsCommand
            {
                UserId = request.UserId,
                Points = HelpQuestionPoints,
                ActionType = ActionType.AyudaPreguntaAbierta,
                SourceEventId = Guid.NewGuid(),
                Description = "Primera pregunta abierta en el Centro de Ayuda"
            }, cancellationToken);

            _logger.LogInformation("Usuario {UserId} desbloqueó el logro del Centro de Ayuda.", request.UserId);
            return new ActionRewardResult { Rewarded = true, UnlockedAchievements = result.UnlockedAchievements };
        }
    }
}
