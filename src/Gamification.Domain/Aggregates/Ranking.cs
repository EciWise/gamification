using System;
using System.Collections.Generic;
using System.Linq;
using Gamification.Domain.Entities;
using Gamification.Domain.Enums;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Aggregates
{
    public class Ranking : AggregateRoot<Guid>
    {
        public RankingType Type { get; private set; }
        public SubjectCode? SubjectCode { get; private set; }
        public DateRange Period { get; private set; }
        private readonly List<RankingEntry> _entries = new();
        public IReadOnlyCollection<RankingEntry> Entries => _entries.AsReadOnly();

        private Ranking() { }

        public Ranking(Guid id, RankingType type, DateRange period, SubjectCode? subjectCode = null)
        {
            Id = id;
            Type = type;
            Period = period ?? throw new ArgumentNullException(nameof(period));
            SubjectCode = subjectCode;
        }

        public void Recalculate(List<UserRankingData> rankingData)
        {
            _entries.Clear();
            var sortedData = rankingData.OrderByDescending(d => d.Score).ToList();

            for (int i = 0; i < sortedData.Count; i++)
            {
                _entries.Add(new RankingEntry(Guid.NewGuid(), sortedData[i].UserId, i + 1, sortedData[i].Score, DateTime.UtcNow));
            }
        }

        public int GetUserPosition(UserId userId)
        {
            return _entries.FirstOrDefault(e => e.UserId.Equals(userId))?.Position ?? -1;
        }
    }

    public class RankingEntry : Entity
    {
        public UserId UserId { get; private set; }
        public int Position { get; private set; }
        public decimal Score { get; private set; }
        public DateTime ComputedAt { get; private set; }

        private RankingEntry() { }

        public RankingEntry(Guid id, UserId userId, int position, decimal score, DateTime computedAt)
        {
            Id = id;
            UserId = userId ?? throw new ArgumentNullException(nameof(userId));
            Position = position;
            Score = score;
            ComputedAt = computedAt;
        }
    }
}
