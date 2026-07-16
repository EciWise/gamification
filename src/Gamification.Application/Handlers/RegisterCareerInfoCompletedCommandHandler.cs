using System;
using MediatR;
using Gamification.Application.Commands;
using Gamification.Domain.Enums;
using Gamification.Domain.Repositories;

namespace Gamification.Application.Handlers
{
    /// <summary>Desbloquea el logro de información de carrera (sin puntos) la primera vez.</summary>
    public sealed class RegisterCareerInfoCompletedCommandHandler
        : OneTimeRewardCommandHandler<RegisterCareerInfoCompletedCommand>
    {
        public RegisterCareerInfoCompletedCommandHandler(IUserGamificationRepository users, IMediator mediator)
            : base(users, mediator)
        {
        }

        protected override Guid GetUserId(RegisterCareerInfoCompletedCommand command) => command.UserId;
        protected override ActionType Action => ActionType.CarreraInfoCompletada;
        protected override int Points => 0;
        protected override string GetDescription(RegisterCareerInfoCompletedCommand command) =>
            "Información de carrera completada";
    }
}
