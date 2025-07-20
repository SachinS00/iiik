@extends('layouts.app')

@section('title', 'All Products')

@section('content')
<div class="container py-4">
    <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3 col-md-4 mb-4">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Filters</h5>
                </div>
                <div class="card-body">
                    <form method="GET" action="{{ route('products.index') }}">
                        <!-- Search -->
                        <div class="mb-3">
                            <label class="form-label">Search</label>
                            <input type="text" class="form-control" name="search" value="{{ request('search') }}" placeholder="Search products...">
                        </div>
                        
                        <!-- Categories -->
                        <div class="mb-3">
                            <label class="form-label">Category</label>
                            <select class="form-select" name="category">
                                <option value="">All Categories</option>
                                @foreach($categories as $category)
                                <option value="{{ $category->id }}" {{ request('category') == $category->id ? 'selected' : '' }}>
                                    {{ $category->name }}
                                </option>
                                @endforeach
                            </select>
                        </div>
                        
                        <!-- Sort -->
                        <div class="mb-3">
                            <label class="form-label">Sort By</label>
                            <select class="form-select" name="sort">
                                <option value="latest" {{ request('sort') == 'latest' ? 'selected' : '' }}>Latest</option>
                                <option value="price_low" {{ request('sort') == 'price_low' ? 'selected' : '' }}>Price: Low to High</option>
                                <option value="price_high" {{ request('sort') == 'price_high' ? 'selected' : '' }}>Price: High to Low</option>
                                <option value="name" {{ request('sort') == 'name' ? 'selected' : '' }}>Name A-Z</option>
                            </select>
                        </div>
                        
                        <button type="submit" class="btn btn-primary w-100">Apply Filters</button>
                        <a href="{{ route('products.index') }}" class="btn btn-outline-secondary w-100 mt-2">Clear Filters</a>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- Products -->
        <div class="col-lg-9 col-md-8">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>All Products</h2>
                <span class="text-muted">{{ $products->total() }} products found</span>
            </div>
            
            @if($products->count() > 0)
            <div class="row g-4">
                @foreach($products as $product)
                <div class="col-lg-4 col-md-6">
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
            
            <!-- Pagination -->
            <div class="mt-5">
                {{ $products->withQueryString()->links() }}
            </div>
            @else
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No products found</h4>
                <p class="text-muted">Try adjusting your search criteria or browse all categories.</p>
                <a href="{{ route('products.index') }}" class="btn btn-primary">View All Products</a>
            </div>
            @endif
        </div>
    </div>
</div>
@endsection