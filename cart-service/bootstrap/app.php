<?php

require_once __DIR__.'/../vendor/autoload.php';

$app = new Laravel\Lumen\Application(
    dirname(__DIR__)
);

// Enable facades
$app->withFacades();

// Enable Eloquent (optional, nanti kalau pakai DB)
$app->withEloquent();

$app->router->group([
    'namespace' => 'App\Http\Controllers',
], function ($router) {
    require __DIR__.'/../src/routes/web.php';
});

return $app;
