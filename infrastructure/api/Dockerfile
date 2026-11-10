FROM php:8.4-cli-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends libicu-dev libzip-dev libonig-dev libxml2-dev libpng-dev libjpeg62-turbo-dev unzip git && docker-php-ext-configure gd --with-jpeg && docker-php-ext-install -j2 pdo_mysql intl mbstring bcmath zip pcntl dom xml xmlwriter gd && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY uploads.ini /usr/local/etc/php/conf.d/segno.ini
WORKDIR /app
EXPOSE 8000
CMD ["php","artisan","serve","--host=0.0.0.0","--port=8000","--no-reload"]
