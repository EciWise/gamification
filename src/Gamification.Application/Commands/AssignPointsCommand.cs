using System;
using MediatR;
using Gamification.Domain.Enums;

namespace Gamification.Application.Commands
{
    public class AssignPointsCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public int Points { get; set; }
        public ActionType ActionType { get; set; }
        public string Description { get; set; }
        public Guid SourceEventId { get; set; }
    }
}