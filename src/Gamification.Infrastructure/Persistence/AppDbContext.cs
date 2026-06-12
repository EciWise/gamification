using Microsoft.EntityFrameworkCore;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Entities;
using Gamification.Domain.ValueObjects;

namespace Gamification.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public DbSet<UserGamification> UserGamifications { get; set; }
        public DbSet<PointTransaction> PointTransactions { get; set; }
        public DbSet<LevelDefinition> LevelDefinitions { get; set; }
        public DbSet<UserAchievement> UserAchievements { get; set; }
        public DbSet<AchievementDefinition> AchievementDefinitions { get; set; }
        public DbSet<Ranking> Rankings { get; set; }
        public DbSet<GamificationRule> GamificationRules { get; set; }
        public DbSet<UserLevelHistory> UserLevelHistories { get; set; }
        public DbSet<WeeklyActivity> WeeklyActivities { get; set; }
        public DbSet<OutboxEvent> Outbox { get; set; }
        public DbSet<ProcessedEvent> ProcessedEvents { get; set; }

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
                
                entity.Ignore(e => e.UserId);

                entity.OwnsOne(e => e.TotalPoints, p => { p.Property(pt => pt.Value).HasColumnName("total_points"); });
                entity.OwnsOne(e => e.ReputationScore, r => { r.Property(rs => rs.Value).HasColumnName("reputation_score"); });

                entity.HasOne(e => e.CurrentLevel).WithMany().HasForeignKey("current_level_id");

                entity.OwnsMany(e => e.ActionStats, a =>
                {
                    a.ToTable("user_action_stats");
                    a.WithOwner().HasForeignKey("user_id");
                    a.Property(s => s.ActionType).HasConversion<string>().HasColumnName("action_type");
                    a.Property(s => s.Count).HasColumnName("count");
                    a.Property(s => s.LastUpdated).HasColumnName("last_updated");
                    a.HasKey("user_id", "ActionType");
                });
                entity.Navigation(e => e.ActionStats).AutoInclude();
                entity.Metadata.FindNavigation(nameof(UserGamification.ActionStats))?.SetPropertyAccessMode(PropertyAccessMode.Field);
            });

            modelBuilder.Entity<PointTransaction>(entity =>
            {
                entity.ToTable("point_transactions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ActionType).HasConversion<string>();
                entity.Ignore(e => e.UserId);
                entity.OwnsOne(e => e.Points, p => { p.Property(pt => pt.Value).HasColumnName("points"); });
                entity.OwnsOne(e => e.IdempotencyKey, i => { i.Property(ik => ik.Value).HasColumnName("idempotency_key"); });
                entity.OwnsOne(e => e.Description, d => { d.Property(desc => desc.Value).HasColumnName("description"); });
            });
            
            modelBuilder.Entity<LevelDefinition>(entity =>
            {
                entity.ToTable("level_definitions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.OwnsOne(e => e.MinPoints, p => { p.Property(pt => pt.Value).HasColumnName("min_points"); });
            });

            modelBuilder.Entity<AchievementDefinition>(entity =>
            {
                entity.ToTable("achievement_definitions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.OwnsOne(e => e.CriteriaConfig, c => { c.Property(cc => cc.JsonRaw).HasColumnName("criteria_config").HasColumnType("jsonb"); });
            });

            modelBuilder.Entity<UserAchievement>(entity =>
            {
                entity.ToTable("user_achievements");
                entity.HasKey(e => e.Id);
                entity.Ignore(e => e.UserId);
                entity.HasIndex("AchievementId").IsUnique();
            });

            modelBuilder.Entity<Ranking>(entity =>
            {
                entity.ToTable("rankings");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Type).HasConversion<string>();
                entity.OwnsOne(e => e.Period, p =>
                {
                    p.Property(pr => pr.Start).HasColumnName("period_start");
                    p.Property(pr => pr.End).HasColumnName("period_end");
                });
                entity.OwnsOne(e => e.SubjectCode, s => { s.Property(sc => sc.Value).HasColumnName("subject_code"); });
                entity.HasMany(e => e.Entries).WithOne().HasForeignKey("ranking_id");
            });

            modelBuilder.Entity<RankingEntry>(entity =>
            {
                entity.ToTable("ranking_entries");
                entity.HasKey(e => e.Id);
                entity.Ignore(e => e.UserId);
            });

            modelBuilder.Entity<GamificationRule>(entity =>
            {
                entity.ToTable("gamification_rules");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ActionType).HasConversion<string>();
                entity.OwnsOne(e => e.PointsAwarded, p => { p.Property(pt => pt.Value).HasColumnName("points_awarded"); });
            });

            modelBuilder.Entity<UserLevelHistory>(entity =>
            {
                entity.ToTable("user_level_history");
                entity.HasKey(e => e.Id);
                entity.Ignore(e => e.UserId);
                entity.OwnsOne(e => e.PointsAtThatMoment, p => { p.Property(pt => pt.Value).HasColumnName("points_at"); });
            });

            modelBuilder.Entity<WeeklyActivity>(entity =>
            {
                entity.ToTable("weekly_activity");
                entity.HasKey(e => e.Id);
                entity.Ignore(e => e.UserId);
                entity.OwnsOne(e => e.PointsEarned, p => { p.Property(pt => pt.Value).HasColumnName("points_earned"); });
            });

            modelBuilder.Entity<OutboxEvent>(entity =>
            {
                entity.ToTable("outbox");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Payload).HasColumnType("jsonb");
            });

            modelBuilder.Entity<ProcessedEvent>(entity =>
            {
                entity.ToTable("processed_events");
                entity.HasKey(e => e.EventId);
            });

            modelBuilder.Ignore<Gamification.Domain.Events.DomainEvent>();
            modelBuilder.Ignore<Gamification.Domain.Events.PointsAddedEvent>();
            modelBuilder.Ignore<Gamification.Domain.Events.AchievementUnlockedEvent>();
            modelBuilder.Ignore<Gamification.Domain.Events.LevelUpEvent>();
            modelBuilder.Ignore<Gamification.Domain.Events.LowRatingAlertEvent>();
        }
    }
}
