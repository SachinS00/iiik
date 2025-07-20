<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'sale_price',
        'sku',
        'stock_quantity',
        'manage_stock',
        'in_stock',
        'is_featured',
        'images',
        'material',
        'color',
        'dimensions',
        'weight',
        'category_id',
        'status'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'manage_stock' => 'boolean',
        'in_stock' => 'boolean',
        'is_featured' => 'boolean',
        'images' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getMainImageAttribute()
    {
        if ($this->images && count($this->images) > 0) {
            return $this->images[0];
        }
        return 'images/no-image.jpg';
    }

    public function getActualPriceAttribute()
    {
        return $this->sale_price ?: $this->price;
    }

    public function getIsOnSaleAttribute()
    {
        return $this->sale_price && $this->sale_price < $this->price;
    }
}