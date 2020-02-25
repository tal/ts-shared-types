FROM node:10

RUN mkdir -p /opt/app
WORKDIR /opt/app
ADD . /opt/app

# Force production because we need to build and yarn install respects NODE_ENV
# TODO: only trigger reinstalls if yarn.lock changes
RUN yarn install --frozen-lockfile --production=false
RUN yarn run build
# TODO: Cleanup and re-install only prod deps to shrink image size

ENV SERVER_PORT=3000
EXPOSE 3000

ENTRYPOINT [ "yarn", "run", "start" ]
