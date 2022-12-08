FROM ghcr.io/puppeteer/puppeteer:18.2.1 AS runtime
USER root

RUN npm i -g pm2 typescript ts-node
ENV LANG en_US.utf8
# Install project dependencies

COPY /package.json \
	./yarn.lock \
	./tsconfig.json \
	./.puppeteer.cjs \
	./.pm2-docker.json \
	./

COPY /app ./app

RUN yarn install --frozen-lock-file && \
    yarn run build
COPY ./ ./
RUN ls
EXPOSE 8443

RUN yarn cache clean --force

RUN chown -R node:"$(id -u node)" ./dist
RUN chown -R node:"$(id -u node)" ./app

USER node
CMD ["yarn", "dev"]