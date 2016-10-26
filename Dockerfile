FROM node:7-slim
MAINTAINER Victor Gama <hey@vito.io>
EXPOSE 3000

ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

RUN mkdir /app
WORKDIR /app

COPY package.json /app/package.json
RUN npm install

LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.name="Digest UI" \
      org.label-schema.description="Front-end facility for the Digest project" \
      org.label-schema.url="http://digest.d3.do" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-url="https://github.com/d3estudio/digest-ui" \
      org.label-schema.vendor="D3 Estudio" \
      org.label-schema.version=$VERSION \
      org.label-schema.schema-version="1.0"

COPY . /app

CMD ["npm", "start"]
