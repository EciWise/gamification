FROM mcr.microsoft.com/dotnet/sdk:10.0@sha256:ea8bde36c11b6e7eec2656d0e59101d4462f6bd630730f2c8201ed0572b295d5 AS build
WORKDIR /repo

COPY src/ src/

RUN dotnet restore src/Gamification.Api/Gamification.Api.csproj && \
    dotnet publish src/Gamification.Api/Gamification.Api.csproj \
        --no-restore \
        --configuration Release \
        --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine3.23@sha256:57bd717ac18ff6c8a39cc0ee4a76c1f15adc46df50434c73eff0c3f1df4c88f0 AS runtime
WORKDIR /app

RUN apk upgrade --no-cache && \
    apk add --no-cache wget && \
    addgroup -S appgroup && \
    adduser -S -G appgroup -H appuser

COPY --from=build /app/publish .

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "Gamification.Api.dll"]
