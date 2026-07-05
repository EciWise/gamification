using System;
using MediatR;
using Gamification.Application.Commands;
using Gamification.Domain.Enums;
using Gamification.Domain.Repositories;

namespace Gamification.Application.Handlers
{
    /// <summary>Otorga 20 puntos y el logro de perfil de IA la primera vez.</summary>
    public sealed class RegisterAiProfileCompletedCommandHandler
        : OneTimeRewardCommandHandler<RegisterAiProfileCompletedCommand>
    {
        public RegisterAiProfileCompletedCommandHandler(IUserGamificationRepository users, IMediator mediator)
            : base(users, mediator)
        {
        }

        protected override Guid GetUserId(RegisterAiProfileCompletedCommand command) => command.UserId;
        protected override ActionType Action => ActionType.PerfilIACompletado;
        protected override int Points => 20;
        protected override string GetDescription(RegisterAiProfileCompletedCommand command) => "Perfil de IA completado";
    }
}
