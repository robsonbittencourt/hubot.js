FROM node:7.1.0-alpine

RUN apk add --update bash curl && rm -rf /var/cache/apk/*

ARG version

RUN npm install -g huboty@$version

CMD hubot start --t $BOT_API_KEY --n $BOT_NAME && tail -F -n0 /etc/hosts
