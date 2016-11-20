FROM node:7.1.0-alpine

RUN apk add --update bash curl && rm -rf /var/cache/apk/*

ARG version

RUN npm install -g hubot.js@$version

CMD hubot start --t $BOT_API_TOKEN --n $BOT_NAME && tail -F -n0 /etc/hosts
