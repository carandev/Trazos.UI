# Builds the Blazor WebAssembly docs site and serves it with nginx.
# Build context: the repository root (Trazos.UI needs packages/tokens).
#   docker build -f docs/Trazos.UI.Docs/Dockerfile -t trazos-ui-docs .

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /repo

COPY Directory.Build.props ./
COPY packages/tokens/tokens.css packages/tokens/utilities.css packages/tokens/
COPY src/Trazos.UI/ src/Trazos.UI/
COPY docs/Trazos.UI.Docs/ docs/Trazos.UI.Docs/

RUN dotnet publish docs/Trazos.UI.Docs/Trazos.UI.Docs.csproj -c Release -o /out

FROM nginx:1.29-alpine

LABEL org.opencontainers.image.source="https://github.com/carandev/Trazos.UI" \
      org.opencontainers.image.description="Trazos.UI documentation site"

COPY docs/Trazos.UI.Docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /out/wwwroot /usr/share/nginx/html

EXPOSE 80
