using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Gamification.Application.Commands;
using Gamification.Domain.Repositories;
using Gamification.Domain.ValueObjects;
using Gamification.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Gamification.Application.Handlers
{
    public class AssignPointsCommandHandler : IRequestHandler<AssignPointsCommand, bool>
    {
        private readonly IUserGamificationRepository _userGamificationRepository;
        private readonly ILogger<AssignPointsCommandHandler> _logger;

        public AssignPointsCommandHandler(
            IUserGamificationRepository userGamificationRepository,
            ILogger<AssignPointsCommandHandler> logger)
        {
            _userGamificationRepository = userGamificationRepository ?? throw new ArgumentNullException(nameof(userGamificationRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> Handle(AssignPointsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var userId = new UserId(request.UserId);
                var userGamification = await _userGamificationRepository.GetByUserIdAsync(userId);

                if (userGamification == null)
                {
                    _logger.LogWarning("User with ID {UserId} was not found in gamification system.", request.UserId);
                    return false; // Or throw custom DomainException
                }

                var points = new Points(request.Points);
                var description = new EventDescription(request.Description);
                var idempotencyKey = new IdempotencyKey($"{request.SourceEventId}-{request.ActionType}");

                var transaction = new PointTransaction(
                    Guid.NewGuid(),
                    userId,
                    points,
                    request.ActionType,
                    description,
                    request.SourceEventId,
                    idempotencyKey,
                    DateTime.UtcNow
                );

                userGamification.AddPoints(transaction);
                userGamification.IncrementStat(request.ActionType, 1);

                // Note: Domain events (like PointsAddedEvent) are inside userGamification.DomainEvents now.
                // Outbox pattern interceptor in EF Core should pick these up and save them to the outbox table.
                
                await _userGamificationRepository.SaveAsync(userGamification);

                _logger.LogInformation("Successfully assigned {Points} points to User {UserId} for {ActionType}", request.Points, request.UserId, request.ActionType);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning points to user {UserId}", request.UserId);
                throw;
            }
        }
    }
}