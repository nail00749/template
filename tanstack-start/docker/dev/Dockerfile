FROM oven/bun:1.4.3

WORKDIR /app

COPY package.json bun.lock* ./
COPY vendor ./vendor
RUN bun ci --ignore-scripts

COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev"]
