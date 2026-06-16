using System;
using MediatR;

namespace Gamification.Application.Commands
{
    public class UnlockAchievementCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public Guid AchievementId { get; set; }
        public Guid SourceEventId { get; set; }
    }
}
