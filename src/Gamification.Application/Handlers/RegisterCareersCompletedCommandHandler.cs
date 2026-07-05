using System;
using MediatR;
using Gamification.Application.Commands;
using Gamification.Domain.Enums;
using Gamification.Domain.Repositories;

namespace Gamification.Application.Handlers
{
    /// <summary>Otorga 20 puntos y el logro de carreras confirmadas la primera vez.</summary>
    public sealed class RegisterCareersCompletedCommandHandler
        : OneTimeRewardCommandHandler<RegisterCareersCompletedCommand>
    {
        public RegisterCareersCompletedCommandHandler(IUserGamificationRepository users, IMediator mediator)
            : base(users, mediator)
        {
        }

        protected override Guid GetUserId(RegisterCareersCompletedCommand command) => command.UserId;
        protected override ActionType Action => ActionType.CarrerasCompletadas;
        protected override int Points => 20;
        protected override string GetDescription(RegisterCareersCompletedCommand command) => "Carreras confirmadas";
    }
}
