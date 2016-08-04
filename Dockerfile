FROM mhart/alpine-node
RUN apk add --no-cache dnsmasq git docker
# RUN echo "address=/#/127.0.0.1" >> /etc/dnsmasq.conf
RUN echo "user=root" >> /etc/dnsmasq.conf
ADD . /usr/src/app
WORKDIR /usr/src/app
RUN npm install
CMD npm start
EXPOSE 53 53/udp 60000-61000
VOLUME ['/var/run/docker.sock', '/etc/autodocker']
RUN echo "docker run --tty -p 53:53 -v /var/run/docker.sock:/var/run/docker.sock autodocker"
# HEALTHCHECK
