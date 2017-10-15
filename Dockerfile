FROM node:8.7.0-alpine

RUN apk add --update bash curl gcc g++ && rm -rf /var/cache/apk/*

ARG version

#Try remo --unsafe-per when update node again
RUN npm install -g hubot.js@$version --unsafe-per

CMD hubot start --t $BOT_API_TOKEN --n $BOT_NAME && tail -F -n0 /etc/hosts