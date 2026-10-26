FROM php:7.4-apache
RUN sed -i 's#deb.debian.org/debian-security#archive.debian.org/debian-security#; s#deb.debian.org/debian#archive.debian.org/debian#; /bullseye-updates/d' /etc/apt/sources.list \
 && apt-get update &&apt-get install -y --no-install-recommends libldap2-dev libpng-dev libjpeg-dev libfreetype6-dev libxml2-dev libzip-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install mysqli gd ldap zip \
 && rm -rf /var/lib/apt/lists/* \
 && printf "session.gc_maxlifetime=2400\nmax_execution_time=120\nmemory_limit=512M\n" > /usr/local/etc/php/conf.d/testlink.ini
