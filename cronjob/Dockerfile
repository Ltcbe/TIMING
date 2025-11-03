FROM alpine:latest

RUN apk add --no-cache curl

WORKDIR /app

COPY cronjob.sh .

RUN chmod +x cronjob.sh

CMD ["./cronjob.sh"]
