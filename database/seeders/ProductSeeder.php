<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();
        
        $products = [
            // Living Room
            [
                'name' => 'Modern L-Shaped Sofa',
                'slug' => 'modern-l-shaped-sofa',
                'description' => 'Contemporary L-shaped sofa with premium fabric upholstery and sturdy wooden frame. Perfect for modern living rooms.',
                'short_description' => 'Contemporary L-shaped sofa with premium fabric upholstery.',
                'price' => 85000.00,
                'sale_price' => 75000.00,
                'sku' => 'SOF-001',
                'stock_quantity' => 15,
                'is_featured' => true,
                'material' => 'Fabric, Wood',
                'color' => 'Grey',
                'dimensions' => '250cm x 180cm x 85cm',
                'weight' => 85.5,
                'category_id' => $categories->where('slug', 'living-room')->first()->id,
                'status' => 'active',
            ],
            [
                'name' => 'Glass Coffee Table',
                'slug' => 'glass-coffee-table',
                'description' => 'Elegant glass coffee table with chrome legs. Adds a touch of sophistication to any living room.',
                'short_description' => 'Elegant glass coffee table with chrome legs.',
                'price' => 25000.00,
                'sku' => 'TAB-001',
                'stock_quantity' => 25,
                'is_featured' => true,
                'material' => 'Tempered Glass, Chrome',
                'color' => 'Clear',
                'dimensions' => '120cm x 60cm x 45cm',
                'weight' => 35.0,
                'category_id' => $categories->where('slug', 'living-room')->first()->id,
                'status' => 'active',
            ],
            [
                'name' => 'TV Entertainment Unit',
                'slug' => 'tv-entertainment-unit',
                'description' => 'Modern TV entertainment unit with ample storage space for media devices and accessories.',
                'short_description' => 'Modern TV unit with ample storage space.',
                'price' => 45000.00,
                'sale_price' => 38000.00,
                'sku' => 'TV-001',
                'stock_quantity' => 12,
                'material' => 'MDF, Laminate',
                'color' => 'Walnut',
                'dimensions' => '180cm x 45cm x 55cm',
                'weight' => 55.0,
                'category_id' => $categories->where('slug', 'living-room')->first()->id,
                'status' => 'active',
            ],

            // Bedroom
            [
                'name' => 'King Size Platform Bed',
                'slug' => 'king-size-platform-bed',
                'description' => 'Modern king size platform bed with upholstered headboard. Includes storage drawers underneath.',
                'short_description' => 'Modern king size platform bed with storage.',
                'price' => 65000.00,
                'sku' => 'BED-001',
                'stock_quantity' => 8,
                'is_featured' => true,
                'material' => 'Wood, Fabric',
                'color' => 'Dark Brown',
                'dimensions' => '210cm x 180cm x 105cm',
                'weight' => 75.0,
                'category_id' => $categories->where('slug', 'bedroom')->first()->id,
                'status' => 'active',
            ],
            [
                'name' => '3-Door Wardrobe',
                'slug' => '3-door-wardrobe',
                'description' => 'Spacious 3-door wardrobe with mirror, hanging space, and multiple shelves for organized storage.',
                'short_description' => 'Spacious 3-door wardrobe with mirror.',
                'price' => 55000.00,
                'sale_price' => 48000.00,
                'sku' => 'WAR-001',
                'stock_quantity' => 10,
                'material' => 'MDF, Glass',
                'color' => 'White',
                'dimensions' => '180cm x 60cm x 220cm',
                'weight' => 95.0,
                'category_id' => $categories->where('slug', 'bedroom')->first()->id,
                'status' => 'active',
            ],
            [
                'name' => 'Bedside Table Set',
                'slug' => 'bedside-table-set',
                'description' => 'Set of 2 matching bedside tables with drawers and open storage compartments.',
                'short_description' => 'Set of 2 matching bedside tables.',
                'price' => 18000.00,
                'sku' => 'BST-001',
                'stock_quantity' => 20,
                'material' => 'Wood',
                'color' => 'Natural Oak',
                'dimensions' => '45cm x 35cm x 55cm each',
                'weight' => 15.0,
                'category_id' => $categories->where('slug', 'bedroom')->first()->id,
                'status' => 'active',
            ],

            // Dining Room
            [
                'name' => '6-Seater Dining Set',
                'slug' => '6-seater-dining-set',
                'description' => 'Complete 6-seater dining set with rectangular table and comfortable upholstered chairs.',
                'short_description' => 'Complete 6-seater dining set with table and chairs.',
                'price' => 75000.00,
                'sale_price' => 68000.00,
                'sku' => 'DIN-001',
                'stock_quantity' => 6,
                'is_featured' => true,
                'material' => 'Solid Wood, Fabric',
                'color' => 'Brown',
                'dimensions' => '180cm x 90cm x 75cm',
                'weight' => 120.0,
                'category_id' => $categories->where('slug', 'dining-room')->first()->id,
                'status' => 'active',
            ],
            [
                'name' => 'Dining Buffet Cabinet',
                'slug' => 'dining-buffet-cabinet',
                'description' => 'Elegant dining room buffet with glass doors and interior lighting for displaying dinnerware.',
                'short_description' => 'Elegant dining buffet with glass doors.',
                'price' => 42000.00,
                'sku' => 'BUF-001',
                'stock_quantity' => 8,
                'material' => 'Wood, Glass',
                'color' => 'Mahogany',
                'dimensions' => '150cm x 45cm x 85cm',
                'weight' => 65.0,
                'category_id' => $categories->where('slug', 'dining-room')->first()->id,
                'status' => 'active',
            ],

            // Office
            [
                'name' => 'Executive Office Desk',
                'slug' => 'executive-office-desk',
                'description' => 'Professional executive desk with multiple drawers, cable management, and premium finish.',
                'short_description' => 'Professional executive desk with storage.',
                'price' => 35000.00,
                'sku' => 'OFF-001',
                'stock_quantity' => 15,
                'is_featured' => true,
                'material' => 'MDF, Laminate',
                'color' => 'Black',
                'dimensions' => '150cm x 75cm x 75cm',
                'weight' => 45.0,
                'category_id' => $categories->where('slug', 'office')->first()->id,
                'status' => 'active',
            ],
            [
                'name' => 'Ergonomic Office Chair',
                'slug' => 'ergonomic-office-chair',
                'description' => 'Comfortable ergonomic office chair with lumbar support, adjustable height, and breathable mesh back.',
                'short_description' => 'Ergonomic chair with lumbar support.',
                'price' => 18000.00,
                'sale_price' => 15000.00,
                'sku' => 'CHA-001',
                'stock_quantity' => 25,
                'material' => 'Mesh, Plastic, Metal',
                'color' => 'Black',
                'dimensions' => '65cm x 65cm x 110cm',
                'weight' => 18.5,
                'category_id' => $categories->where('slug', 'office')->first()->id,
                'status' => 'active',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}