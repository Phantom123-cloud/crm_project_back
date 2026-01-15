FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn config set registry https://registry.npmjs.org \
 && yarn config set network-timeout 600000 -g \
 && yarn install --frozen-lockfile
COPY . .
RUN npx prisma generate
RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
CMD ["sh", "-lc", "node dist/main.js"]
