using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Entities;
using Gamification.Domain.Repositories;
using Gamification.Domain.ValueObjects;

namespace Gamification.Infrastructure.Persistence.Repositories
{
    public class UserGamificationRepository : IUserGamificationRepository
    {
        private readonly AppDbContext _context;

        public UserGamificationRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<UserGamification?> GetByUserIdAsync(UserId userId)
        {
            return await _context.UserGamifications
                .Include(u => u.CurrentLevel)
                .FirstOrDefaultAsync(u => u.Id == userId.Value);
        }

        public async Task SaveAsync(UserGamification userGamification)
        {
            if (_context.Entry(userGamification).State == EntityState.Detached)
            {
                await _context.UserGamifications.AddAsync(userGamification);
            }
            else
            {
                _context.UserGamifications.Update(userGamification);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<LevelDefinition>> GetLevelsOrderedAsync()
        {
            var levels = await _context.LevelDefinitions.ToListAsync();
            return levels.OrderBy(l => l.MinPoints.Value).ToList();
        }
    }
}