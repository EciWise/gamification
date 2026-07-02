using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Gamification.Application.Commands;
using Gamification.Application.Handlers;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Entities;
using Gamification.Domain.Enums;
using Gamification.Domain.Repositories;
using Gamification.Domain.Services;
using Gamification.Domain.ValueObjects;
using Xunit;

namespace Gamification.Application.Tests
{
    public class AssignPointsCommandHandlerTests
    {
        private readonly Mock<IUserGamificationRepository> _userRepoMock;
        private readonly Mock<IAchievementDefinitionRepository> _achievementDefRepoMock;
        private readonly Mock<IUserAchievementRepository> _userAchievementRepoMock;
        private readonly Mock<IAchievementStrategyFactory> _strategyFactoryMock;
        private readonly Mock<ILogger<AssignPointsCommandHandler>> _loggerMock;
        private readonly AssignPointsCommandHandler _handler;

        public AssignPointsCommandHandlerTests()
        {
            _userRepoMock = new Mock<IUserGamificationRepository>();
            _achievementDefRepoMock = new Mock<IAchievementDefinitionRepository>();
            _userAchievementRepoMock = new Mock<IUserAchievementRepository>();
            _strategyFactoryMock = new Mock<IAchievementStrategyFactory>();
            _loggerMock = new Mock<ILogger<AssignPointsCommandHandler>>();

            // Sin definiciones de logros activas: el handler solo asigna puntos.
            _achievementDefRepoMock.Setup(r => r.GetAllActiveAsync())
                .ReturnsAsync(new List<AchievementDefinition>());
            _userAchievementRepoMock.Setup(r => r.GetByUserIdAsync(It.IsAny<UserId>()))
                .ReturnsAsync(new List<UserAchievement>());

            var domainService = new GamificationDomainService(_strategyFactoryMock.Object);

            _handler = new AssignPointsCommandHandler(
                _userRepoMock.Object,
                _achievementDefRepoMock.Object,
                _userAchievementRepoMock.Object,
                domainService,
                _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_ShouldAssignPoints_WhenUserExists()
        {
            var userId = Guid.NewGuid();
            var level = new LevelDefinition(Guid.NewGuid(), "Level 1", new Points(0));
            var user = new UserGamification(new UserId(userId), level);
            _userRepoMock.Setup(r => r.GetByUserIdAsync(It.IsAny<UserId>())).ReturnsAsync(user);
            _userRepoMock.Setup(r => r.GetLevelsOrderedAsync())
                .ReturnsAsync(new List<LevelDefinition> { level });

            var command = new AssignPointsCommand
            {
                UserId = userId,
                Points = 10,
                ActionType = ActionType.TutoriaCompletada,
                SourceEventId = Guid.NewGuid(),
                Description = "Test"
            };

            var result = await _handler.Handle(command, CancellationToken.None);

            result.Success.Should().BeTrue();
            user.TotalPoints.Value.Should().Be(10);
        }
    }
}
