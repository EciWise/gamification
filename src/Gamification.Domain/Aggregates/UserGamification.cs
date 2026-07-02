using System;
using System.Collections.Generic;
using System.Linq;
using Gamification.Domain.Entities;
using Gamification.Domain.Enums;
using Gamification.Domain.Events;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Aggregates
{
    public class UserGamification : AggregateRoot<UserId>
    {
        private List<UserActionStat> _actionStats = new();
        
        public UserId UserId { get; private set; }
        public Points TotalPoints { get; private set; }
        public LevelDefinition CurrentLevel { get; private set; }
        public ReputationScore ReputationScore { get; private set; }
        public IReadOnlyList<UserActionStat> ActionStats => _actionStats.AsReadOnly();

        // Constructor de materialización para EF Core: las propiedades no anulables
        // las puebla el proveedor al cargar desde la base de datos.
        private UserGamification()
        {
            UserId = null!;
            TotalPoints = null!;
            CurrentLevel = null!;
            ReputationScore = null!;
        }

        public UserGamification(UserId userId, LevelDefinition initialLevel)
        {
            Id = userId.Value;
            UserId = userId ?? throw new ArgumentNullException(nameof(userId));
            TotalPoints = Points.Zero;
            CurrentLevel = initialLevel ?? throw new ArgumentNullException(nameof(initialLevel));
            ReputationScore = new ReputationScore(0);
        }

        public void AddPoints(PointTransaction transaction)
        {
            if (transaction == null) throw new ArgumentNullException(nameof(transaction));

            TotalPoints = TotalPoints.Add(transaction.Points);
            AddDomainEvent(new PointsAddedEvent(Id, transaction.Points, transaction.ActionType));
        }

        /// <summary>
        /// Level Up de test jijijiji
        /// </summary>
        public void PromoteTo(LevelDefinition newLevel)
        {
            if (newLevel == null) throw new ArgumentNullException(nameof(newLevel));
            if (CurrentLevel != null && CurrentLevel.Id == newLevel.Id) return;

            CurrentLevel = newLevel;
            AddDomainEvent(new LevelUpEvent(Id, newLevel.Name));
        }

        public void IncrementStat(ActionType actionType, int amount = 1)
        {
            var stat = _actionStats.FirstOrDefault(s => s.ActionType == actionType);
            if (stat != null)
            {
                _actionStats.Remove(stat);
                _actionStats.Add(stat.Increment(amount));
            }
            else
            {
                _actionStats.Add(new UserActionStat(actionType, amount, DateTime.UtcNow));
            }
        }

        public int GetStat(ActionType actionType)
        {
            return _actionStats.FirstOrDefault(s => s.ActionType == actionType)?.Count ?? 0;
        }

        public UserAchievement UnlockAchievement(AchievementDefinition achievement)
        {
            if (achievement == null) throw new ArgumentNullException(nameof(achievement));

            // `UserId` (VO) está marcada como Ignore en EF, por lo que es null en
            // entidades materializadas desde BD. `Id` (Guid) siempre está poblado.
            var userAchievement = new UserAchievement(Guid.NewGuid(), new UserId(Id), achievement, DateTime.UtcNow);
            AddDomainEvent(new AchievementUnlockedEvent(Id, achievement.Id));
            return userAchievement;
        }
    }
}