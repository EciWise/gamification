using System;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using RabbitMQ.Client;

namespace Gamification.Infrastructure.Messaging
{
    public interface IRabbitMqProducer
    {
        Task PublishAsync<T>(string exchange, string routingKey, T message);
    }

    public class RabbitMqProducer : IRabbitMqProducer
    {
        private readonly IConnection _connection;

        public RabbitMqProducer(IConnection connection)
        {
            _connection = connection;
        }

        public async Task PublishAsync<T>(string exchange, string routingKey, T message)
        {
            using var channel = await _connection.CreateChannelAsync();

            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

            var properties = new BasicProperties();
            properties.Persistent = true;

            await channel.BasicPublishAsync(
                exchange: exchange,
                routingKey: routingKey,
                mandatory: true,
                basicProperties: properties,
                body: body);
        }
    }
}
