FROM alpine

RUN apk add --update bash nodejs curl && rm -rf /var/cache/apk/*

WORKDIR /hubot

COPY ./package.json /hubot/

RUN npm install --production

COPY ./ /hubot/

CMD BOT_API_TOKEN=$BOT_API_TOKEN BOT_NAME=$BOT_NAME node app.js
