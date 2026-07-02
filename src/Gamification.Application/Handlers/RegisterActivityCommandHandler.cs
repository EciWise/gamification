using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Gamification.Application.Commands;
using Microsoft.Extensions.Logging;

namespace Gamification.Application.Handlers
{
    /// <summary>Otorga puntos por una actividad recurrente, delegando en <see cref="AssignPointsCommand"/>.</summary>
    public class RegisterActivityCommandHandler : IRequestHandler<RegisterActivityCommand, ActionRewardResult>
    {
        private readonly IMediator _mediator;
        private readonly ILogger<RegisterActivityCommandHandler> _logger;

        public RegisterActivityCommandHandler(IMediator mediator, ILogger<RegisterActivityCommandHandler> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ActionRewardResult> Handle(RegisterActivityCommand request, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new AssignPointsCommand
            {
                UserId = request.UserId,
                Points = request.Points,
                ActionType = request.ActionType,
                SourceEventId = Guid.NewGuid(),
                Description = request.Description
            }, cancellationToken);

            _logger.LogInformation(
                "Actividad {ActionType} registrada para {UserId} (+{Points} pts, {Count} logro(s)).",
                request.ActionType, request.UserId, request.Points, result.UnlockedAchievements.Count);

            return new ActionRewardResult { Rewarded = true, UnlockedAchievements = result.UnlockedAchievements };
        }
    }
}
