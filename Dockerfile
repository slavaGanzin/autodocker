FROM mhart/alpine-node
RUN apk add --no-cache dnsmasq git docker
RUN echo "address=/#/127.0.0.1" >> /etc/dnsmasq.conf
RUN echo "user=root" >> /etc/dnsmasq.conf
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
CMD npm start
EXPOSE 53 53/udp
