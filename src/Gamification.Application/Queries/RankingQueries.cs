using System;
using System.Collections.Generic;
using MediatR;
using Gamification.Domain.Enums;

namespace Gamification.Application.Queries
{
    public class GetUserRankingQuery : IRequest<UserRankingDto?>
    {
        public Guid UserId { get; set; }
        public RankingType Type { get; set; }
    }

    public class UserRankingDto
    {
        public Guid UserId { get; set; }
        public int Position { get; set; }
        public decimal Score { get; set; }
    }

    public class GetUserAchievementsQuery : IRequest<List<AchievementDto>>
    {
        public Guid UserId { get; set; }
    }

    public class AchievementDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public DateTime UnlockedAt { get; set; }
    }
}
