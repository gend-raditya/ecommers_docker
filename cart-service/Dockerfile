FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git unzip zip libpq-dev \
    && docker-php-ext-install pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY composer.json /var/www/composer.bootstrap.json
RUN if [ ! -f /var/www/composer.json ]; then \
    composer create-project --prefer-dist laravel/lumen:^10.0 src ; \
    fi

COPY .env /var/www/src/.env
COPY src/routes/web.php /var/www/src/routes/web.php
RUN chown -R www-data:www-data /var/www/src

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "src/public", "src/public/index.php"]
