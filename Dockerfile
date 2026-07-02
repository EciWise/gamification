# syntax=docker/dockerfile:1

# ---- build ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restaura primero con solo los .csproj para cachear las dependencias.
COPY src/Gamification.Api/Gamification.Api.csproj src/Gamification.Api/
COPY src/Gamification.Application/Gamification.Application.csproj src/Gamification.Application/
COPY src/Gamification.Domain/Gamification.Domain.csproj src/Gamification.Domain/
COPY src/Gamification.Infrastructure/Gamification.Infrastructure.csproj src/Gamification.Infrastructure/
COPY src/Gamification.Messaging/Gamification.Messaging.csproj src/Gamification.Messaging/
RUN dotnet restore src/Gamification.Api/Gamification.Api.csproj

# Copia el resto y publica.
COPY . .
RUN dotnet publish src/Gamification.Api/Gamification.Api.csproj \
    -c Release -o /app/publish /p:UseAppHost=false

# ---- runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
# libgssapi (Kerberos) evita el warning del probe SASL de RabbitMQ.Client.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Gamification.Api.dll"]
