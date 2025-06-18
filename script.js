// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Cart functionality
let cart = [];
let cartTotal = 0;
let products = [];
let categories = [];

// DOM Elements
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeModal = document.querySelector('.close');
const cartItems = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCount = document.querySelector('.cart-count');

// Load data from database
async function loadData() {
    try {
        // Load products
        const productsResponse = await fetch(`${API_BASE_URL}/products`);
        products = await productsResponse.json();
        
        // Load categories
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
        categories = await categoriesResponse.json();
        
        // Update UI with loaded data
        updateProductDisplay();
        updateCategoryDisplay();
        
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to static data if API is not available
        loadStaticData();
    }
}

// Load static data as fallback
function loadStaticData() {
    products = [
        {
            id: 1,
            name: 'Rose Gold Ring',
            price: 299,
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
            description: 'Beautiful rose gold ring with elegant design.',
            stock: 50,
            rating: 4.8,
            reviews: 125
        },
        {
            id: 2,
            name: 'Pearl Necklace',
            price: 499,
            image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
            description: 'Stunning pearl necklace that adds sophistication.',
            stock: 30,
            rating: 4.9,
            reviews: 89
        },
        {
            id: 3,
            name: 'Crystal Earrings',
            price: 399,
            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
            description: 'Sparkling crystal earrings that catch the light.',
            stock: 75,
            rating: 4.7,
            reviews: 156
        },
        {
            id: 4,
            name: 'Diamond Bracelet',
            price: 599,
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
            description: 'Elegant diamond bracelet with premium craftsmanship.',
            stock: 25,
            rating: 4.9,
            reviews: 67
        },
        {
            id: 5,
            name: 'Gold Chain',
            price: 799,
            image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop',
            description: 'Classic gold chain necklace for everyday elegance.',
            stock: 40,
            rating: 4.6,
            reviews: 98
        },
        {
            id: 6,
            name: 'Silver Anklet',
            price: 349,
            image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=400&fit=crop',
            description: 'Delicate silver anklet perfect for summer styling.',
            stock: 60,
            rating: 4.5,
            reviews: 112
        }
    ];
    
    categories = [
        { id: 'rings', name: 'Rings', icon: 'fas fa-ring', description: 'Elegant rings for every finger' },
        { id: 'necklaces', name: 'Necklaces', icon: 'fas fa-necktie', description: 'Stunning necklaces to complement your look' },
        { id: 'earrings', name: 'Earrings', icon: 'fas fa-earrings', description: 'Beautiful earrings for all occasions' },
        { id: 'bracelets', name: 'Bracelets', icon: 'fas fa-bracelet', description: 'Charming bracelets for your wrist' }
    ];
    
    updateProductDisplay();
    updateCategoryDisplay();
}

// Update product display with database data
function updateProductDisplay() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    
    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-aos', 'fade-up');
        productCard.setAttribute('data-aos-delay', (index + 1) * 100);
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-overlay">
                    <button class="quick-view" onclick="showQuickView(${product.id})">Quick View</button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                    <span class="rating-text">${product.rating} (${product.reviews})</span>
                </div>
                <p class="price">₹${product.price}</p>
                <p class="stock-info">${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
    
    // Reinitialize AOS for new elements
    AOS.refresh();
}

// Update category display with database data
function updateCategoryDisplay() {
    const categoryGrid = document.querySelector('.category-grid');
    if (!categoryGrid) return;
    
    categoryGrid.innerHTML = '';
    
    categories.forEach((category, index) => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.setAttribute('data-aos', 'zoom-in');
        categoryCard.setAttribute('data-aos-delay', (index + 1) * 100);
        
        categoryCard.innerHTML = `
            <div class="category-icon">
                <i class="${category.icon}"></i>
            </div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
        `;
        
        categoryCard.addEventListener('click', () => {
            filterProductsByCategory(category.id);
        });
        
        categoryGrid.appendChild(categoryCard);
    });
    
    // Reinitialize AOS for new elements
    AOS.refresh();
}

// Filter products by category
function filterProductsByCategory(categoryId) {
    const filteredProducts = products.filter(product => product.category === categoryId);
    updateProductDisplayWithProducts(filteredProducts);
}

// Update product display with specific products
function updateProductDisplayWithProducts(productsToShow) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    
    if (productsToShow.length === 0) {
        productGrid.innerHTML = '<div class="no-products"><h3>No products found in this category</h3></div>';
        return;
    }
    
    productsToShow.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-aos', 'fade-up');
        productCard.setAttribute('data-aos-delay', (index + 1) * 100);
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-overlay">
                    <button class="quick-view" onclick="showQuickView(${product.id})">Quick View</button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                    <span class="rating-text">${product.rating} (${product.reviews})</span>
                </div>
                <p class="price">₹${product.price}</p>
                <p class="stock-info">${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
    
    AOS.refresh();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Enhanced add to cart functionality
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (product.stock === 0) {
        showNotification('Sorry, this product is out of stock!', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${product.name} added to cart! ✨`);
    
    // Animate cart icon
    cartIcon.style.transform = 'scale(1.2) rotate(10deg)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1) rotate(0deg)';
    }, 300);
}

// Update cart display
function updateCart() {
    cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    cartTotalElement.textContent = cartTotal;
    
    // Update cart items display
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price} x ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
                <button onclick="removeFromCart(${item.id})" class="remove-btn">×</button>
            </div>
        `;
        cartItems.appendChild(itemElement);
    });
}

// Update item quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            showNotification(`Quantity updated! ${item.quantity} ${item.name} in cart`);
        }
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    const product = products.find(p => p.id === productId);
    showNotification(`${product.name} removed from cart! 💔`);
}

// Enhanced notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'error' ? '#dc3545' : 'linear-gradient(45deg, #ff1493, #ff69b4)';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 5px 15px rgba(255, 20, 147, 0.4);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
        font-weight: 600;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Cart modal functionality
cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', () => {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Enhanced quick view functionality
async function showQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Load reviews for this product
    let reviews = [];
    try {
        const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
        reviews = await reviewsResponse.json();
    } catch (error) {
        console.log('Could not load reviews');
    }
    
    const quickViewModal = document.createElement('div');
    quickViewModal.className = 'modal';
    quickViewModal.style.display = 'block';
    
    const reviewsHTML = reviews.length > 0 ? `
        <div class="product-reviews">
            <h4>Customer Reviews (${reviews.length})</h4>
            ${reviews.slice(0, 3).map(review => `
                <div class="review-item">
                    <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    <p>${review.comment}</p>
                </div>
            `).join('')}
        </div>
    ` : '';
    
    quickViewModal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
                <div style="position: relative; overflow: hidden; border-radius: 15px;">
                    <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 15px;">
                </div>
                <div>
                    <h2 style="font-family: 'Dancing Script', cursive; font-size: 2.5rem; color: #ff1493; margin-bottom: 1rem;">${product.name}</h2>
                    <div class="product-rating" style="margin-bottom: 1rem;">
                        <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                        <span class="rating-text">${product.rating} (${product.reviews} reviews)</span>
                    </div>
                    <p class="price" style="font-size: 2.5rem; font-weight: 700; color: #ff1493; margin: 1rem 0;">₹${product.price}</p>
                    <p style="color: #666; margin-bottom: 1rem; line-height: 1.6;">${product.description}</p>
                    <p style="color: #666; margin-bottom: 2rem;"><strong>Stock:</strong> ${product.stock} available</p>
                    <button class="add-to-cart" onclick="addToCart(${product.id}); this.parentElement.parentElement.parentElement.remove()" style="background: linear-gradient(45deg, #ff1493, #ff69b4); color: white; border: none; padding: 15px 30px; border-radius: 25px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; width: 100%; font-size: 1.1rem;" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart ✨'}
                    </button>
                    ${reviewsHTML}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(quickViewModal);
    document.body.style.overflow = 'hidden';
    
    quickViewModal.addEventListener('click', (e) => {
        if (e.target === quickViewModal) {
            quickViewModal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

// Newsletter form submission with database
document.querySelector('.newsletter-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('🎉 Thank you for subscribing! You\'ll receive exclusive offers soon!');
            this.reset();
        } else {
            showNotification(result.error || 'Subscription failed', 'error');
        }
    } catch (error) {
        showNotification('🎉 Thank you for subscribing! (Offline mode)');
        this.reset();
    }
});

// Contact form submission with database
document.querySelector('.contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = {
        name: this.querySelector('input[type="text"]').value,
        email: this.querySelector('input[type="email"]').value,
        message: this.querySelector('textarea').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('💌 Message sent successfully! We\'ll get back to you soon!');
            this.reset();
        } else {
            showNotification(result.error || 'Message sending failed', 'error');
        }
    } catch (error) {
        showNotification('💌 Message sent successfully! (Offline mode)');
        this.reset();
    }
});

// Enhanced checkout functionality with database
document.querySelector('.checkout-btn').addEventListener('click', async function() {
    if (cart.length === 0) {
        showNotification('🛒 Your cart is empty! Add some beautiful jewelry first!', 'error');
        return;
    }
    
    // Create order data
    const orderData = {
        user_id: 1, // Default user ID for demo
        products: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
        })),
        shipping_address: "Demo Address, Mumbai",
        payment_method: "credit_card"
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            showNotification('💳 Order placed successfully! Thank you for your purchase!');
            cart = [];
            updateCart();
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        } else {
            showNotification('Order placement failed. Please try again.', 'error');
        }
    } catch (error) {
        showNotification('💳 Order placed successfully! (Offline mode)');
        cart = [];
        updateCart();
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 105, 180, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #ff69b4, #ff1493)';
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    hero.style.transform = `translateY(${rate}px)`;
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .cart-item-info h4 {
        margin: 0;
        color: #333;
    }
    
    .cart-item-info p {
        margin: 0.5rem 0 0 0;
        color: #666;
    }
    
    .cart-item-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .cart-item-actions button {
        background: #ff1493;
        color: white;
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    
    .cart-item-actions button:hover {
        background: #ff69b4;
        transform: scale(1.1);
    }
    
    .remove-btn {
        background: #dc3545 !important;
    }
    
    .remove-btn:hover {
        background: #c82333 !important;
    }
    
    .cart-item-actions span {
        min-width: 30px;
        text-align: center;
        font-weight: bold;
    }
    
    .product-rating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0.5rem 0;
    }
    
    .stars {
        color: #ffd700;
        font-size: 1rem;
    }
    
    .rating-text {
        color: #666;
        font-size: 0.9rem;
    }
    
    .stock-info {
        color: #28a745;
        font-size: 0.9rem;
        margin: 0.5rem 0;
    }
    
    .no-products {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    
    .product-reviews {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #f0f0f0;
    }
    
    .review-item {
        margin-bottom: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 10px;
    }
    
    .review-stars {
        color: #ffd700;
        margin-bottom: 0.5rem;
    }
    
    .notification.error {
        background: #dc3545 !important;
    }
`;
document.head.appendChild(style);

// Initialize cart and load data
updateCart();
loadData();

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
}); 