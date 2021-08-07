FROM node:14

WORKDIR /app

COPY ./app .

COPY ./scripts/test /scripts

RUN chmod +x /scripts/*

ENTRYPOINT [ "/scripts/entrypoint.sh" ]