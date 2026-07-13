using System;
using MediatR;
using Gamification.Application.Commands;
using Gamification.Domain.Enums;
using Gamification.Domain.Repositories;

namespace Gamification.Application.Handlers
{
    /// <summary>Desbloquea el logro del Centro de Ayuda (sin puntos) la primera vez.</summary>
    public sealed class RegisterHelpQuestionOpenedCommandHandler
        : OneTimeRewardCommandHandler<RegisterHelpQuestionOpenedCommand>
    {
        public RegisterHelpQuestionOpenedCommandHandler(IUserGamificationRepository users, IMediator mediator)
            : base(users, mediator)
        {
        }

        protected override Guid GetUserId(RegisterHelpQuestionOpenedCommand command) => command.UserId;
        protected override ActionType Action => ActionType.AyudaPreguntaAbierta;
        protected override int Points => 0;
        protected override string GetDescription(RegisterHelpQuestionOpenedCommand command) =>
            "Primera pregunta abierta en el Centro de Ayuda";
    }
}
