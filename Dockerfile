FROM ghcr.io/puppeteer/puppeteer:18.2.1 AS builder

WORKDIR /app

COPY . /app

ENV LANG en_US.utf8

# Install project dependencies
RUN yarn run test && \
    yarn run release

FROM ghcr.io/puppeteer/puppeteer:18.2.1 AS runtime

ENV NODE_ENV=production
ENV PM2_HOME=/app/.pm2

EXPOSE 8443

WORKDIR /app

COPY --from=builder \
    /app/package.json \
    /app/package-lock.json \
    /app/.pm2-docker.json \
    ./

RUN yarn ci --production && \
    yarn cache clean --force && \
    mkdir databases

COPY --from=builder /app/dist dist

RUN chown -R node:"$(id -u node)" /app

USER node

CMD ["npm", "run", "start-docker"]
