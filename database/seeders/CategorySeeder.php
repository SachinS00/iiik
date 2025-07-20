<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Living Room',
                'slug' => 'living-room',
                'description' => 'Comfortable and stylish furniture for your living room including sofas, coffee tables, and entertainment units.',
                'is_active' => true,
            ],
            [
                'name' => 'Bedroom',
                'slug' => 'bedroom',
                'description' => 'Rest and relaxation furniture including beds, wardrobes, dressers, and nightstands.',
                'is_active' => true,
            ],
            [
                'name' => 'Dining Room',
                'slug' => 'dining-room',
                'description' => 'Elegant dining furniture including dining tables, chairs, and storage solutions.',
                'is_active' => true,
            ],
            [
                'name' => 'Office',
                'slug' => 'office',
                'description' => 'Professional office furniture including desks, chairs, and storage solutions.',
                'is_active' => true,
            ],
            [
                'name' => 'Storage',
                'slug' => 'storage',
                'description' => 'Organize your space with our selection of storage furniture and solutions.',
                'is_active' => true,
            ],
            [
                'name' => 'Outdoor',
                'slug' => 'outdoor',
                'description' => 'Weather-resistant outdoor furniture for your garden, patio, or balcony.',
                'is_active' => true,
            ],
            [
                'name' => 'Decor',
                'slug' => 'decor',
                'description' => 'Home decor items and accessories to complete your interior design.',
                'is_active' => true,
            ],
            [
                'name' => 'Kids',
                'slug' => 'kids',
                'description' => 'Safe and colorful furniture designed specifically for children\'s rooms.',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}