FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json .
COPY pnpm-lock.yaml .

RUN npm install -g pnpm
RUN pnpm install

COPY . .

# Generate the Prisma client and types
RUN pnpx prisma generate

RUN pnpm run build

FROM node:lts-alpine AS runner

WORKDIR /app

# Copy package.json and node_modules (includes @prisma/client)
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built app files (dist folder)
COPY --from=builder /app/dist ./dist

EXPOSE 8393

CMD ["npm", "run", "start:prod"]