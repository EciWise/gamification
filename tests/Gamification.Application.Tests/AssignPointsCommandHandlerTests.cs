using System;
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
using Gamification.Domain.ValueObjects;
using Xunit;

namespace Gamification.Application.Tests
{
    public class AssignPointsCommandHandlerTests
    {
        private readonly Mock<IUserGamificationRepository> _userRepoMock;
        private readonly Mock<ILogger<AssignPointsCommandHandler>> _loggerMock;
        private readonly AssignPointsCommandHandler _handler;

        public AssignPointsCommandHandlerTests()
        {
            _userRepoMock = new Mock<IUserGamificationRepository>();
            _loggerMock = new Mock<ILogger<AssignPointsCommandHandler>>();
            _handler = new AssignPointsCommandHandler(_userRepoMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_ShouldAssignPoints_WhenUserExists()
        {
            var userId = Guid.NewGuid();
            var level = new LevelDefinition(Guid.NewGuid(), "Level 1", new Points(0));
            var user = new UserGamification(new UserId(userId), level);
            _userRepoMock.Setup(r => r.GetByUserIdAsync(It.IsAny<UserId>())).ReturnsAsync(user);

            var command = new AssignPointsCommand
            {
                UserId = userId,
                Points = 10,
                ActionType = ActionType.TutoriaCompletada,
                SourceEventId = Guid.NewGuid(),
                Description = "Test"
            };

            var result = await _handler.Handle(command, CancellationToken.None);

            result.Should().BeTrue();
            user.TotalPoints.Value.Should().Be(10);
        }
    }
}
