<?php

use Illuminate\Http\Request;

$cartFile = __DIR__ . '/../../cart.json';

// GET /carts
$router->get('/carts', function () use ($cartFile) {
    if (!file_exists($cartFile)) {
        file_put_contents($cartFile, json_encode(["items" => [], "total" => 0]));
    }
    $cart = json_decode(file_get_contents($cartFile), true);
    return response()->json($cart);
});

// POST /carts/add
$router->post('/carts/add', function (Request $request) use ($cartFile) {
    $productId = $request->input('product_id');
    if (!$productId) {
        return response()->json(['error' => 'product_id is required'], 400);
    }

    $productServiceUrl = "http://product-service:8001/products/" . $productId;
    $productJson = @file_get_contents($productServiceUrl);

    if (!$productJson) {
        return response()->json(['error' => 'Product not found'], 404);
    }

    $product = json_decode($productJson, true);

    $cart = json_decode(file_get_contents($cartFile), true);
    $cart['items'][] = $product;
    $cart['total'] += $product["price"] ?? 0;

    file_put_contents($cartFile, json_encode($cart));

    return response()->json($cart);
});
// POST /carts/remove
$router->post('/carts/remove', function (Request $request) use ($cartFile) {
    $productId = $request->input('product_id');
    if (!$productId) return response()->json(['error' => 'product_id is required'], 400);

    $cart = getCart($cartFile);

    // Hapus item
    $cart['items'] = array_values(array_filter($cart['items'], function($item) use ($productId) {
        return $item['id'] != $productId;
    }));

    // Rehitung total
    $cart['total'] = array_sum(array_map(function($item) { return $item['price'] ?? 0; }, $cart['items']));

    saveCart($cartFile, $cart);

    return response()->json($cart);
});
