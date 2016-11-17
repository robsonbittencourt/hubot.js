FROM node:7.1.0-alpine

RUN apk add --update bash curl && rm -rf /var/cache/apk/*

WORKDIR /hubot

COPY ./hubot.js-1.0.0.tgz /hubot/

RUN npm install -g hubot.js-1.0.0.tgz

CMD hubot start --t $BOT_API_TOKEN --n $BOT_NAME && tail -F -n0 /etc/hosts
