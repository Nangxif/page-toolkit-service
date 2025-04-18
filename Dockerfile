FROM node:22-alpine3.19
ENV SERVICE_NAME="page-toolkit-service"

COPY . /
WORKDIR /

RUN npm i -g pnpm
RUN pnpm install

# 只暴露应用端口
EXPOSE 3001

CMD ["pnpm", "start:dev"]