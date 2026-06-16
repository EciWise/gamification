using System;
using System.Collections.Generic;
using FluentAssertions;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Enums;
using Gamification.Domain.ValueObjects;
using Xunit;

namespace Gamification.Domain.Tests
{
    public class RankingTests
    {
        [Fact]
        public void Recalculate_ShouldSortUsersByScore()
        {
            var ranking = new Ranking(Guid.NewGuid(), RankingType.GlobalPorPuntos, new DateRange(DateTime.UtcNow.AddDays(-7), DateTime.UtcNow));
            var rankingData = new List<UserRankingData>
            {
                new UserRankingData(new UserId(Guid.NewGuid()), 50m),
                new UserRankingData(new UserId(Guid.NewGuid()), 100m)
            };

            ranking.Recalculate(rankingData);

            ranking.Entries.Should().HaveCount(2);
            var entries = new List<RankingEntry>(ranking.Entries);
            entries[0].Score.Should().Be(100m);
            entries[1].Score.Should().Be(50m);
        }
    }
}
