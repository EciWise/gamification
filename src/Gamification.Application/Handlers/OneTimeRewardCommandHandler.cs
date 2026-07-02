using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Gamification.Application.Commands;
using Gamification.Domain.Enums;
using Gamification.Domain.Repositories;
using Gamification.Domain.ValueObjects;

namespace Gamification.Application.Handlers
{
    /// <summary>
    /// Base para acciones que recompensan una sola vez: si el usuario ya registró
    /// la acción, no vuelve a otorgar puntos ni a reevaluar logros.
    /// </summary>
    public abstract class OneTimeRewardCommandHandler<TCommand> : IRequestHandler<TCommand, ActionRewardResult>
        where TCommand : IRequest<ActionRewardResult>
    {
        private readonly IUserGamificationRepository _users;
        private readonly IMediator _mediator;

        protected OneTimeRewardCommandHandler(IUserGamificationRepository users, IMediator mediator)
        {
            _users = users ?? throw new ArgumentNullException(nameof(users));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        protected abstract Guid GetUserId(TCommand command);
        protected abstract ActionType Action { get; }
        protected abstract int Points { get; }
        protected abstract string GetDescription(TCommand command);

        public async Task<ActionRewardResult> Handle(TCommand command, CancellationToken cancellationToken)
        {
            var userId = GetUserId(command);
            var user = await _users.GetByUserIdAsync(new UserId(userId));
            if (user != null && user.GetStat(Action) >= 1)
            {
                return new ActionRewardResult { Rewarded = false };
            }

            var result = await _mediator.Send(new AssignPointsCommand
            {
                UserId = userId,
                Points = Points,
                ActionType = Action,
                SourceEventId = Guid.NewGuid(),
                Description = GetDescription(command)
            }, cancellationToken);

            return new ActionRewardResult { Rewarded = true, UnlockedAchievements = result.UnlockedAchievements };
        }
    }
}
