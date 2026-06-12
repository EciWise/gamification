using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Gamification.Domain.Enums;
using StackExchange.Redis;
using System.Text.Json;

namespace Gamification.Infrastructure.Cache
{
    public interface IRankingCache
    {
        Task<string?> GetTopRankingsAsync(RankingType rankingType, string? subjectCode);
        Task SetTopRankingsAsync(RankingType rankingType, string? subjectCode, object data);
        Task InvalidateRankingAsync(RankingType rankingType, string? subjectCode);
    }

    public class RedisRankingCache : IRankingCache
    {
        private readonly IDatabase _db;
        public RedisRankingCache(IConnectionMultiplexer redis) => _db = redis.GetDatabase();

        private string GetKey(RankingType rankingType, string? subjectCode) =>
            $"ranking:{rankingType}{(subjectCode != null ? ":" + subjectCode : "")}";

        public async Task<string?> GetTopRankingsAsync(RankingType rankingType, string? subjectCode) =>
            await _db.StringGetAsync(GetKey(rankingType, subjectCode));

        public async Task SetTopRankingsAsync(RankingType rankingType, string? subjectCode, object data) =>
            await _db.StringSetAsync(GetKey(rankingType, subjectCode), JsonSerializer.Serialize(data), TimeSpan.FromMinutes(10));

        public async Task InvalidateRankingAsync(RankingType rankingType, string? subjectCode) =>
            await _db.KeyDeleteAsync(GetKey(rankingType, subjectCode));
    }
}
