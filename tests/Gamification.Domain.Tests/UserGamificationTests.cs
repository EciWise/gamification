using System;
using System.Collections.Generic;
using FluentAssertions;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Entities;
using Gamification.Domain.Enums;
using Gamification.Domain.ValueObjects;
using Xunit;

namespace Gamification.Domain.Tests
{
    public class UserGamificationTests
    {
        [Fact]
        public void AddPoints_ShouldIncreaseTotalPoints()
        {
            var userId = new UserId(Guid.NewGuid());
            var level = new LevelDefinition(Guid.NewGuid(), "Level 1", new Points(0));
            var user = new UserGamification(userId, level);
            var pointsToAdd = new Points(10);
            var transaction = new PointTransaction(Guid.NewGuid(), userId, pointsToAdd, ActionType.TutoriaCompletada, new EventDescription("Test"), Guid.NewGuid(), new IdempotencyKey("test"), DateTime.UtcNow);

            user.AddPoints(transaction);

            user.TotalPoints.Value.Should().Be(10);
        }

        [Fact]
        public void IncrementStat_ShouldIncreaseActionCount()
        {
            var userId = new UserId(Guid.NewGuid());
            var level = new LevelDefinition(Guid.NewGuid(), "Level 1", new Points(0));
            var user = new UserGamification(userId, level);

            user.IncrementStat(ActionType.MaterialAprobado, 1);
            user.IncrementStat(ActionType.MaterialAprobado, 2);

            user.GetStat(ActionType.MaterialAprobado).Should().Be(3);
        }
    }
}
