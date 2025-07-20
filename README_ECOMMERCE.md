# FurnitureHub - E-Commerce Website

A modern, full-featured e-commerce website built with Laravel 12, similar to Nilkamal Furniture. This application provides a complete online furniture shopping experience with a clean, responsive design.

## 🚀 Features

### Customer Features
- **Modern Homepage** with hero section, featured products, and categories
- **Product Catalog** with search, filtering, and sorting capabilities
- **Product Details** with image gallery, specifications, and related products
- **Shopping Cart** with add/remove/update functionality
- **User Authentication** (Register, Login, Profile Management)
- **Order Management** and order history
- **Responsive Design** optimized for all devices
- **SEO-Friendly** URLs and meta tags

### Admin Features (Ready for Extension)
- Product management system
- Category management
- Order management
- User management
- Dashboard with analytics

### Technical Features
- **Laravel 12** with modern PHP 8.4
- **Bootstrap 5.3** for responsive UI
- **MySQL/SQLite** database
- **Eloquent ORM** for database operations
- **Laravel Breeze** for authentication
- **Blade Templates** for server-side rendering
- **RESTful APIs** for cart operations
- **CSRF Protection** and security best practices

## 🛠️ Installation & Setup

### Prerequisites
- PHP 8.4 or higher
- Composer
- Node.js and NPM
- MySQL or SQLite

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-website
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   # For SQLite (default)
   touch database/database.sqlite
   
   # For MySQL, update .env with your database credentials
   # DB_CONNECTION=mysql
   # DB_HOST=127.0.0.1
   # DB_PORT=3306
   # DB_DATABASE=your_database
   # DB_USERNAME=your_username
   # DB_PASSWORD=your_password
   ```

6. **Run migrations and seed data**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

7. **Build frontend assets**
   ```bash
   npm run build
   ```

8. **Start the development server**
   ```bash
   php artisan serve
   ```

The application will be available at `http://localhost:8000`

## 📁 Project Structure

```
ecommerce-website/
├── app/
│   ├── Http/Controllers/     # Application controllers
│   │   ├── HomeController.php
│   │   ├── ProductController.php
│   │   ├── CartController.php
│   │   └── OrderController.php
│   └── Models/              # Eloquent models
│       ├── Category.php
│       ├── Product.php
│       ├── Cart.php
│       ├── Order.php
│       └── OrderItem.php
├── database/
│   ├── migrations/          # Database migrations
│   └── seeders/            # Sample data seeders
├── resources/
│   └── views/              # Blade templates
│       ├── layouts/
│       ├── products/
│       └── cart/
├── routes/
│   └── web.php             # Web routes
└── public/                 # Public assets
```

## 🗄️ Database Schema

### Categories
- id, name, slug, description, image, is_active, timestamps

### Products
- id, name, slug, description, short_description, price, sale_price, sku
- stock_quantity, manage_stock, in_stock, is_featured, images (JSON)
- material, color, dimensions, weight, category_id, status, timestamps

### Carts
- id, user_id, product_id, quantity, price, timestamps

### Orders
- id, order_number, user_id, status, total, subtotal, tax, shipping
- billing_address (JSON), shipping_address (JSON), payment details, timestamps

### Order Items
- id, order_id, product_id, quantity, price, total, timestamps

## 🎨 Design Features

### Color Scheme
- Primary: #2c5aa0 (Blue)
- Secondary: #f8f9fa (Light Gray)
- Accent: #ff6b35 (Orange)
- Text: #2d3748 (Dark Gray)

### UI Components
- Modern card-based design
- Hover effects and animations
- Responsive grid layout
- Font Awesome icons
- Bootstrap components

## 🔧 Configuration

### Environment Variables
```env
APP_NAME=FurnitureHub
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=sqlite
DB_DATABASE=/path/to/database.sqlite

# For production, use MySQL
# DB_CONNECTION=mysql
# DB_HOST=your-host
# DB_PORT=3306
# DB_DATABASE=your-database
# DB_USERNAME=your-username
# DB_PASSWORD=your-password
```

## 🚀 Deployment

### Production Setup

1. **Server Requirements**
   - PHP 8.4+
   - MySQL 8.0+
   - Web server (Apache/Nginx)
   - Composer
   - Node.js

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Update .env with production settings
   php artisan key:generate
   ```

3. **Database Setup**
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   ```

4. **Optimize for Production**
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   npm run build
   ```

5. **Web Server Configuration**
   - Point document root to `public/` directory
   - Configure URL rewriting for Laravel routes
   - Set proper file permissions

## 📊 Sample Data

The application comes with pre-populated sample data:

### Categories
- Living Room, Bedroom, Dining Room, Office, Storage, Outdoor, Decor, Kids

### Products
- Modern L-Shaped Sofa (₹75,000 - Sale)
- Glass Coffee Table (₹25,000)
- King Size Platform Bed (₹65,000)
- 6-Seater Dining Set (₹68,000 - Sale)
- Executive Office Desk (₹35,000)
- And more...

### Test User
- Email: test@example.com
- Password: password

## 🔐 Security Features

- CSRF protection on all forms
- Input validation and sanitization
- SQL injection prevention via Eloquent ORM
- XSS protection via Blade templating
- Password hashing with bcrypt
- Authentication middleware for protected routes

## 🎯 Future Enhancements

### Phase 1
- [ ] Product image upload functionality
- [ ] Admin panel for product/category management
- [ ] Order checkout and payment integration
- [ ] Email notifications

### Phase 2
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search with filters
- [ ] Inventory management

### Phase 3
- [ ] Multi-language support (Hindi/English)
- [ ] Mobile app API
- [ ] Advanced analytics
- [ ] SEO optimization

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check .env database configuration
   - Ensure database server is running
   - Verify credentials

2. **Permission Errors**
   ```bash
   chmod -R 755 storage/
   chmod -R 755 bootstrap/cache/
   ```

3. **Assets Not Loading**
   ```bash
   npm run build
   php artisan storage:link
   ```

4. **Session Issues**
   ```bash
   php artisan cache:clear
   php artisan session:table
   php artisan migrate
   ```

## 📞 Support

For support and questions:
- Email: support@furniturehub.com
- Phone: +91 98765 43210

## 📄 License

This project is open-sourced software licensed under the MIT license.

---

**Built with ❤️ using Laravel 12 & Bootstrap 5**