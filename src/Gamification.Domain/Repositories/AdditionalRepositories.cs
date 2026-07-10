using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Entities;
using Gamification.Domain.Enums;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Repositories
{
    public interface IAchievementDefinitionRepository
    {
        Task<AchievementDefinition?> GetByIdAsync(Guid id);
        Task<List<AchievementDefinition>> GetAllActiveAsync();
        Task SaveAsync(AchievementDefinition achievement);
    }

    public interface IGamificationRuleRepository
    {
        Task<GamificationRule?> GetByActionTypeAsync(ActionType actionType);
        Task<List<GamificationRule>> GetAllActiveAsync();
    }

    public interface IRankingRepository
    {
        Task<Ranking?> GetCurrentAsync(RankingType type, SubjectCode? subjectCode);
        Task SaveAsync(Ranking ranking);
    }

    public interface IUserActionStatRepository
    {
        Task<List<UserActionStat>> GetByUserIdAsync(UserId userId);
    }

    public interface IUserAchievementRepository
    {
        Task<List<UserAchievement>> GetByUserIdAsync(UserId userId);
        /// <summary>Rastrea nuevos logros para insertarlos; se persisten en el
        /// SaveChangesAsync del agregado (misma transacción). Att Daniel</summary>
        void AddRange(IEnumerable<UserAchievement> achievements);
    }

    public interface IWeeklyActivityRepository
    {
        Task<WeeklyActivity?> GetCurrentWeekAsync(UserId userId);
        Task SaveAsync(WeeklyActivity activity);
    }
}
