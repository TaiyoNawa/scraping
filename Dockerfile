FROM alpine:edge

RUN apk update && apk upgrade && \
    apk add --no-cache bash openssh expect font-noto-cjk unifont

#Dependancies of puppeteer in alpine container
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      npm \
      yarn

RUN npm i -g typescript @babel/core @babel/node ts-node

RUN addgroup -g 1000 -S pptruser && \
    adduser -D -u 1000 -S -G pptruser pptruser
RUN echo '%pptruser ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

CMD ["bash"]