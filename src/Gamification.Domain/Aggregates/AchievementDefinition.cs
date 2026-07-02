using System;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Aggregates
{
    public class AchievementDefinition : AggregateRoot<Guid>
    {
        public string Name { get; private set; }
        public string Description { get; private set; }
        public string ImageUrl { get; private set; }
        public string StrategyKey { get; private set; }
        public CriteriaConfig CriteriaConfig { get; private set; }
        public bool IsActive { get; private set; }

        // Constructor de materialización para EF Core.
        private AchievementDefinition()
        {
            Name = null!;
            Description = null!;
            ImageUrl = null!;
            StrategyKey = null!;
            CriteriaConfig = null!;
        }

        public AchievementDefinition(Guid id, string name, string description, string imageUrl, string strategyKey, CriteriaConfig criteriaConfig, bool isActive)
        {
            Id = id;
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Description = description;
            ImageUrl = imageUrl;
            StrategyKey = strategyKey ?? throw new ArgumentNullException(nameof(strategyKey));
            CriteriaConfig = criteriaConfig ?? throw new ArgumentNullException(nameof(criteriaConfig));
            IsActive = isActive;
        }
    }
}