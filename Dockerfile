FROM debian:11
RUN apt-get upgrade -y
RUN apt-get update -y
RUN apt-get install curl gnupg2 ca-certificates lsb-release -y
RUN apt-get install nginx -y
RUN apt-get install nodejs -y
RUN apt-get install npm -y
#RUN rm /etc/nginx/conf.d/default.conf
RUN rm /var/www/html/index.*
RUN mv /etc/nginx/sites-available/default /etc/nginx/sites-available/default.back
COPY nginx/nginx.conf /etc/nginx/sites-available/default
# RUN systemctl reload nginx.service
# RUN systemctl restart nginx.service
EXPOSE 80
COPY dist/ /var/www/html
CMD ["nginx", "-g", "daemon off;"]