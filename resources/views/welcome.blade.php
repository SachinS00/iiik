@extends('layouts.app')

@section('title', 'Premium Furniture & Home Decor')

@section('content')
<!-- Hero Section -->
<section class="hero-section">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <h1 class="display-4 fw-bold mb-4">Premium Furniture for Modern Living</h1>
                <p class="lead mb-4">Transform your space with our carefully curated collection of contemporary furniture and home decor. Quality craftsmanship meets modern design.</p>
                <div class="d-flex gap-3">
                    <a href="{{ route('products.index') }}" class="btn btn-light btn-lg">Shop Now</a>
                    <a href="#categories" class="btn btn-outline-light btn-lg">Browse Categories</a>
                </div>
            </div>
            <div class="col-lg-6 text-center">
                <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80" 
                     alt="Modern Living Room" class="img-fluid rounded-3 shadow-lg">
            </div>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="py-5 bg-light">
    <div class="container">
        <div class="row g-4">
            <div class="col-lg-3 col-md-6 text-center">
                <div class="p-4">
                    <i class="fas fa-shipping-fast fa-3x text-primary mb-3"></i>
                    <h5>Free Shipping</h5>
                    <p class="text-muted">Free delivery on orders above ₹10,000</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 text-center">
                <div class="p-4">
                    <i class="fas fa-undo fa-3x text-primary mb-3"></i>
                    <h5>Easy Returns</h5>
                    <p class="text-muted">30-day hassle-free return policy</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 text-center">
                <div class="p-4">
                    <i class="fas fa-tools fa-3x text-primary mb-3"></i>
                    <h5>Expert Assembly</h5>
                    <p class="text-muted">Professional assembly service available</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 text-center">
                <div class="p-4">
                    <i class="fas fa-award fa-3x text-primary mb-3"></i>
                    <h5>Quality Assured</h5>
                    <p class="text-muted">Premium materials and craftsmanship</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Categories Section -->
<section id="categories" class="py-5">
    <div class="container">
        <div class="text-center mb-5">
            <h2 class="display-5 fw-bold">Shop by Category</h2>
            <p class="lead text-muted">Discover furniture for every room in your home</p>
        </div>
        
        <div class="row g-4">
            @forelse($categories as $category)
            <div class="col-lg-3 col-md-6">
                <div class="category-card card h-100">
                    <img src="{{ $category->image ? asset('storage/' . $category->image) : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80' }}" 
                         class="card-img-top" alt="{{ $category->name }}" style="height: 200px; object-fit: cover;">
                    <div class="card-body text-center">
                        <h5 class="card-title">{{ $category->name }}</h5>
                        <p class="card-text text-muted">{{ Str::limit($category->description, 80) }}</p>
                        <a href="{{ route('products.category', $category->slug) }}" class="btn btn-outline-primary">
                            View Products
                        </a>
                    </div>
                </div>
            </div>
            @empty
            <div class="col-12 text-center">
                <p class="text-muted">No categories available.</p>
            </div>
            @endforelse
        </div>
    </div>
</section>

<!-- Featured Products Section -->
@if($featuredProducts->count() > 0)
<section class="py-5 bg-light">
    <div class="container">
        <div class="text-center mb-5">
            <h2 class="display-5 fw-bold">Featured Products</h2>
            <p class="lead text-muted">Hand-picked favorites from our collection</p>
        </div>
        
        <div class="row g-4">
            @foreach($featuredProducts as $product)
            <div class="col-lg-3 col-md-6">
                <div class="card product-card h-100">
                    <div class="position-relative">
                        <img src="{{ $product->main_image ? asset('storage/' . $product->main_image) : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80' }}" 
                             class="card-img-top" alt="{{ $product->name }}" style="height: 250px; object-fit: cover;">
                        @if($product->is_on_sale)
                        <span class="badge bg-danger position-absolute top-0 start-0 m-2">Sale</span>
                        @endif
                        @if($product->is_featured)
                        <span class="badge bg-primary position-absolute top-0 end-0 m-2">Featured</span>
                        @endif
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title">{{ $product->name }}</h6>
                        <p class="card-text text-muted small">{{ $product->category->name }}</p>
                        <p class="card-text flex-grow-1">{{ Str::limit($product->short_description ?: $product->description, 80) }}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    @if($product->is_on_sale)
                                        <span class="text-decoration-line-through text-muted">₹{{ number_format($product->price, 2) }}</span>
                                        <span class="fw-bold text-primary">₹{{ number_format($product->sale_price, 2) }}</span>
                                    @else
                                        <span class="fw-bold text-primary">₹{{ number_format($product->price, 2) }}</span>
                                    @endif
                                </div>
                            </div>
                            <div class="d-flex gap-2">
                                <a href="{{ route('products.show', $product->slug) }}" class="btn btn-outline-primary btn-sm flex-grow-1">
                                    View Details
                                </a>
                                <button class="btn btn-primary btn-sm" onclick="addToCart({{ $product->id }})">
                                    <i class="fas fa-shopping-cart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        
        <div class="text-center mt-5">
            <a href="{{ route('products.index') }}" class="btn btn-primary btn-lg">View All Products</a>
        </div>
    </div>
</section>
@endif

<!-- Latest Products Section -->
@if($latestProducts->count() > 0)
<section class="py-5">
    <div class="container">
        <div class="text-center mb-5">
            <h2 class="display-5 fw-bold">Latest Arrivals</h2>
            <p class="lead text-muted">Discover our newest additions</p>
        </div>
        
        <div class="row g-4">
            @foreach($latestProducts as $product)
            <div class="col-lg-3 col-md-6">
                <div class="card product-card h-100">
                    <div class="position-relative">
                        <img src="{{ $product->main_image ? asset('storage/' . $product->main_image) : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80' }}" 
                             class="card-img-top" alt="{{ $product->name }}" style="height: 250px; object-fit: cover;">
                        @if($product->is_on_sale)
                        <span class="badge bg-danger position-absolute top-0 start-0 m-2">Sale</span>
                        @endif
                        <span class="badge bg-success position-absolute top-0 end-0 m-2">New</span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title">{{ $product->name }}</h6>
                        <p class="card-text text-muted small">{{ $product->category->name }}</p>
                        <p class="card-text flex-grow-1">{{ Str::limit($product->short_description ?: $product->description, 80) }}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    @if($product->is_on_sale)
                                        <span class="text-decoration-line-through text-muted">₹{{ number_format($product->price, 2) }}</span>
                                        <span class="fw-bold text-primary">₹{{ number_format($product->sale_price, 2) }}</span>
                                    @else
                                        <span class="fw-bold text-primary">₹{{ number_format($product->price, 2) }}</span>
                                    @endif
                                </div>
                            </div>
                            <div class="d-flex gap-2">
                                <a href="{{ route('products.show', $product->slug) }}" class="btn btn-outline-primary btn-sm flex-grow-1">
                                    View Details
                                </a>
                                <button class="btn btn-primary btn-sm" onclick="addToCart({{ $product->id }})">
                                    <i class="fas fa-shopping-cart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</section>
@endif

<!-- Newsletter Section -->
<section class="py-5 bg-primary text-white">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <h3 class="fw-bold mb-2">Stay Updated</h3>
                <p class="mb-0">Subscribe to our newsletter for latest updates and exclusive offers.</p>
            </div>
            <div class="col-lg-6">
                <form class="d-flex gap-2">
                    <input type="email" class="form-control" placeholder="Enter your email">
                    <button type="submit" class="btn btn-light">Subscribe</button>
                </form>
            </div>
        </div>
    </div>
</section>
@endsection