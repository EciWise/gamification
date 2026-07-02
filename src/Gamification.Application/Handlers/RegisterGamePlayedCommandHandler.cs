using System;
using MediatR;
using Gamification.Application.Commands;
using Gamification.Domain.Enums;
using Gamification.Domain.Repositories;

namespace Gamification.Application.Handlers
{
    /// <summary>Otorga 10 puntos y el logro "Buscador de aventuras" la primera vez.</summary>
    public sealed class RegisterGamePlayedCommandHandler
        : OneTimeRewardCommandHandler<RegisterGamePlayedCommand>
    {
        public RegisterGamePlayedCommandHandler(IUserGamificationRepository users, IMediator mediator)
            : base(users, mediator)
        {
        }

        protected override Guid GetUserId(RegisterGamePlayedCommand command) => command.UserId;
        protected override ActionType Action => ActionType.JuegoJugado;
        protected override int Points => 10;
        protected override string GetDescription(RegisterGamePlayedCommand command) =>
            string.IsNullOrWhiteSpace(command.GameId)
                ? "Primer juego jugado"
                : $"Primer juego jugado: {command.GameId}";
    }
}
