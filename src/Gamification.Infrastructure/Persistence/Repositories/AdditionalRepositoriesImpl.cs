using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Entities;
using Gamification.Domain.Enums;
using Gamification.Domain.Repositories;
using Gamification.Domain.ValueObjects;

namespace Gamification.Infrastructure.Persistence.Repositories
{
    public class AchievementDefinitionRepository : IAchievementDefinitionRepository
    {
        private readonly AppDbContext _context;
        public AchievementDefinitionRepository(AppDbContext context) => _context = context;

        public async Task<AchievementDefinition?> GetByIdAsync(Guid id) =>
            await _context.AchievementDefinitions.FindAsync(id);

        public async Task<List<AchievementDefinition>> GetAllActiveAsync() =>
            await _context.AchievementDefinitions.ToListAsync();

        public async Task SaveAsync(AchievementDefinition achievement)
        {
            if (_context.Entry(achievement).State == EntityState.Detached)
                _context.AchievementDefinitions.Add(achievement);
            await _context.SaveChangesAsync();
        }
    }

    public class GamificationRuleRepository : IGamificationRuleRepository
    {
        private readonly AppDbContext _context;
        public GamificationRuleRepository(AppDbContext context) => _context = context;

        public async Task<GamificationRule?> GetByActionTypeAsync(ActionType actionType) =>
            await _context.GamificationRules.FirstOrDefaultAsync(r => r.ActionType == actionType);

        public async Task<List<GamificationRule>> GetAllActiveAsync() =>
            await _context.GamificationRules.Where(r => r.IsActive).ToListAsync();
    }

    public class RankingRepository : IRankingRepository
    {
        private readonly AppDbContext _context;
        public RankingRepository(AppDbContext context) => _context = context;

        public async Task<Ranking?> GetCurrentAsync(RankingType type, SubjectCode? subjectCode)
        {
            var query = _context.Rankings.Include(r => r.Entries).Where(r => r.Type == type);
            if (subjectCode != null)
                query = query.Where(r => r.SubjectCode.Value == subjectCode.Value);

            return await query.OrderByDescending(r => r.Period.End).FirstOrDefaultAsync();
        }

        public async Task SaveAsync(Ranking ranking)
        {
            if (_context.Entry(ranking).State == EntityState.Detached)
                _context.Rankings.Add(ranking);
            await _context.SaveChangesAsync();
        }
    }
}
