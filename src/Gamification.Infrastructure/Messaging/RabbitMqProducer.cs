using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using RabbitMQ.Client;

namespace Gamification.Infrastructure.Messaging
{
    /// <summary>
    /// Mantiene perezosamente una conexión a RabbitMQ y la reutiliza entre
    /// publicaciones. Se conecta en el primer uso (no en el arranque) para que la
    /// app levante aunque el broker tarde, y reconstruye la conexión si se cerró.
    /// </summary>
    public interface IRabbitMqConnectionProvider
    {
        Task<IConnection> GetConnectionAsync(CancellationToken cancellationToken = default);
    }

    public sealed class RabbitMqConnectionProvider : IRabbitMqConnectionProvider, IDisposable
    {
        private readonly SemaphoreSlim _gate = new(1, 1);
        private IConnection? _connection;

        public async Task<IConnection> GetConnectionAsync(CancellationToken cancellationToken = default)
        {
            if (_connection is { IsOpen: true })
            {
                return _connection;
            }

            await _gate.WaitAsync(cancellationToken);
            try
            {
                if (_connection is { IsOpen: true })
                {
                    return _connection;
                }

                var factory = new ConnectionFactory();
                var rabbitUri = Environment.GetEnvironmentVariable("RABBITMQ_CONNECTION");
                if (!string.IsNullOrEmpty(rabbitUri))
                {
                    factory.Uri = new Uri(rabbitUri);
                }
                else
                {
                    factory.HostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
                    factory.UserName = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest";
                    factory.Password = Environment.GetEnvironmentVariable("RABBITMQ_PASSWORD") ?? "guest";
                    var vhost = Environment.GetEnvironmentVariable("RABBITMQ_VHOST");
                    if (!string.IsNullOrEmpty(vhost))
                    {
                        factory.VirtualHost = vhost;
                    }
                }

                _connection = await factory.CreateConnectionAsync(cancellationToken);
                return _connection;
            }
            finally
            {
                _gate.Release();
            }
        }

        public void Dispose()
        {
            _connection?.Dispose();
            _gate.Dispose();
        }
    }

    public interface IRabbitMqProducer
    {
        Task PublishAsync<T>(string exchange, string routingKey, T message, CancellationToken cancellationToken = default);
    }

    public class RabbitMqProducer : IRabbitMqProducer
    {
        private readonly IRabbitMqConnectionProvider _connectionProvider;

        public RabbitMqProducer(IRabbitMqConnectionProvider connectionProvider)
        {
            _connectionProvider = connectionProvider;
        }

        public async Task PublishAsync<T>(string exchange, string routingKey, T message, CancellationToken cancellationToken = default)
        {
            var connection = await _connectionProvider.GetConnectionAsync(cancellationToken);
            await using var channel = await connection.CreateChannelAsync(cancellationToken: cancellationToken);

            // Declaramos el exchange (idempotente) para no depender del orden de
            // arranque de los servicios consumidores.
            await channel.ExchangeDeclareAsync(exchange, ExchangeType.Topic, durable: true, autoDelete: false, cancellationToken: cancellationToken);

            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
            var properties = new BasicProperties
            {
                Persistent = true,
                ContentType = "application/json"
            };

            await channel.BasicPublishAsync(
                exchange: exchange,
                routingKey: routingKey,
                mandatory: false,
                basicProperties: properties,
                body: body,
                cancellationToken: cancellationToken);
        }
    }
}
