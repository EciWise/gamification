using Microsoft.EntityFrameworkCore;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Entities;

namespace Gamification.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public DbSet<UserGamification> UserGamifications { get; set; }
        public DbSet<PointTransaction> PointTransactions { get; set; }
        public DbSet<LevelDefinition> LevelDefinitions { get; set; }
        public DbSet<UserAchievement> UserAchievements { get; set; }
        public DbSet<AchievementDefinition> AchievementDefinitions { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserGamification>(entity =>
            {
                entity.ToTable("user_gamification");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Id).HasColumnName("user_id");
                
                entity.OwnsOne(e => e.TotalPoints, p =>
                {
                    p.Property(pt => pt.Value).HasColumnName("total_points");
                });

                entity.OwnsOne(e => e.ReputationScore, r =>
                {
                    r.Property(rs => rs.Value).HasColumnName("reputation_score");
                });
                
                entity.HasOne(e => e.CurrentLevel)
                      .WithMany()
                      .HasForeignKey("current_level_id");
            });

            modelBuilder.Entity<PointTransaction>(entity =>
            {
                entity.ToTable("point_transactions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ActionType).HasConversion<string>();

                entity.OwnsOne(e => e.Points, p => { p.Property(pt => pt.Value).HasColumnName("points"); });
                entity.OwnsOne(e => e.IdempotencyKey, i => { i.Property(ik => ik.Value).HasColumnName("idempotency_key"); });
                entity.OwnsOne(e => e.Description, d => { d.Property(desc => desc.Value).HasColumnName("description"); });
            });
            
            // Note: Keep configuring other entities mappings based on the SQL provided...
        }
    }
}