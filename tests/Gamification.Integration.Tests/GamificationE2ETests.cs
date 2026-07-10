using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Gamification.Api;
using Gamification.Infrastructure.Persistence;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Entities;
using Gamification.Domain.ValueObjects;
using Gamification.Application.Queries;
using Xunit;

namespace Gamification.Integration.Tests
{
    public class GamificationE2ETests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public GamificationE2ETests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Flow_AssignPoints_And_GetRanking()
        {
            // Arrange
            // El host exige un secreto JWT configurado; usamos uno aleatorio en
            // memoria (no un literal) para no fijar credenciales en las pruebas.
            Environment.SetEnvironmentVariable(
                "JWT_SECRET_KEY",
                Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32)));

            var userId = Guid.NewGuid();
            var factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                    if (descriptor != null) services.Remove(descriptor);

                    services.AddDbContext<AppDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("E2E_Test_Db_" + userId.ToString());
                    });

                    var redisDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(StackExchange.Redis.IConnectionMultiplexer));
                    if (redisDescriptor != null) services.Remove(redisDescriptor);
                    services.AddSingleton<StackExchange.Redis.IConnectionMultiplexer>(sp =>
                        Moq.Mock.Of<StackExchange.Redis.IConnectionMultiplexer>());
                });
            });

            var client = factory.CreateClient();

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var level = new LevelDefinition(Guid.NewGuid(), "Level 1", new Points(0));
                db.LevelDefinitions.Add(level);
                db.UserGamifications.Add(new UserGamification(new UserId(userId), level));

                var ranking = new Ranking(Guid.NewGuid(), Domain.Enums.RankingType.GlobalPorPuntos, new DateRange(DateTime.UtcNow.AddDays(-1), DateTime.UtcNow.AddDays(1)));
                ranking.Recalculate(new List<UserRankingData> { new UserRankingData(new UserId(userId), 0m) });
                db.Rankings.Add(ranking);

                await db.SaveChangesAsync();
            }

            // Act - Get current ranking (should be 0 points)
            var response = await client.GetAsync($"/api/Gamification/users/{userId}/ranking");

            // Assert
            response.EnsureSuccessStatusCode();
            var rankingDto = await response.Content.ReadFromJsonAsync<UserRankingDto>();
            rankingDto.Should().NotBeNull();
            rankingDto!.UserId.Should().Be(userId);
            rankingDto.Score.Should().Be(0);
        }
    }
}
