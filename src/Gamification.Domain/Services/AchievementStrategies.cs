using System;
using System.Collections.Generic;
using System.Linq;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Enums;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Services
{
    public class FirstTutoringStrategy : IAchievementStrategy
    {
        public string StrategyKey => "FIRST_TUTORING";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.TutoriaDictada && s.Count >= 1);
        }
    }

    public class ActiveCollaboratorStrategy : IAchievementStrategy
    {
        public string StrategyKey => "ACTIVE_COLLABORATOR";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.MaterialAprobado && s.Count >= 5);
        }
    }

    public class OutstandingTutorStrategy : IAchievementStrategy
    {
        public string StrategyKey => "OUTSTANDING_TUTOR";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            // Requires 10 ratings of 5 stars.
            // Assuming we track "FiveStarRatings" as an ActionType or similar.
            return stats.Any(s => s.ActionType == ActionType.TutoriaCalificada && s.Count >= 10);
        }
    }

    public class MentorOfMonthStrategy : IAchievementStrategy
    {
        public string StrategyKey => "MENTOR_OF_MONTH";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            // This usually requires global context, but for a strategy on a single user:
            return false; // Typically handled by a periodic job that awards it.
        }
    }
}
