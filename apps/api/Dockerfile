FROM node:22-slim
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --filter @studysmart/api...
EXPOSE 3000
CMD ["pnpm", "--filter", "@studysmart/api", "start"]
