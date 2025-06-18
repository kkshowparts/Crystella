const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Database file path
const DB_FILE = path.join(__dirname, 'database.json');

// Helper function to read database
async function readDatabase() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return null;
    }
}

// Helper function to write database
async function writeDatabase(data) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
}

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(db.products);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const product = db.products.find(p => p.id === parseInt(req.params.id));
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get products by category
app.get('/api/products/category/:category', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const products = db.products.filter(p => p.category === req.params.category);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Search products
app.get('/api/products/search/:query', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const query = req.params.query.toLowerCase();
        const products = db.products.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.tags.some(tag => tag.toLowerCase().includes(query))
        );
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(db.categories);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new order
app.post('/api/orders', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const { user_id, products, shipping_address, payment_method } = req.body;
        
        // Calculate total
        const total = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Create new order
        const newOrder = {
            id: db.orders.length + 1,
            user_id,
            products,
            total,
            status: 'pending',
            shipping_address,
            payment_method,
            order_date: new Date().toISOString().split('T')[0],
            delivery_date: null
        };
        
        db.orders.push(newOrder);
        
        // Update product stock
        products.forEach(item => {
            const product = db.products.find(p => p.id === item.product_id);
            if (product) {
                product.stock -= item.quantity;
            }
        });
        
        await writeDatabase(db);
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get orders by user ID
app.get('/api/orders/user/:userId', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const orders = db.orders.filter(o => o.user_id === parseInt(req.params.userId));
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const order = db.orders.find(o => o.id === parseInt(req.params.id));
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        order.status = req.body.status;
        if (req.body.status === 'delivered') {
            order.delivery_date = new Date().toISOString().split('T')[0];
        }
        
        await writeDatabase(db);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add product review
app.post('/api/reviews', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const { product_id, user_id, rating, comment } = req.body;
        
        const newReview = {
            id: db.reviews.length + 1,
            product_id,
            user_id,
            rating,
            comment,
            date: new Date().toISOString().split('T')[0]
        };
        
        db.reviews.push(newReview);
        
        // Update product rating
        const product = db.products.find(p => p.id === product_id);
        if (product) {
            const productReviews = db.reviews.filter(r => r.product_id === product_id);
            const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
            product.rating = Math.round(avgRating * 10) / 10;
            product.reviews = productReviews.length;
        }
        
        await writeDatabase(db);
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get reviews by product ID
app.get('/api/reviews/product/:productId', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const reviews = db.reviews.filter(r => r.product_id === parseInt(req.params.productId));
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Newsletter subscription
app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const { email } = req.body;
        
        // Check if already subscribed
        const existing = db.newsletter_subscribers.find(s => s.email === email);
        if (existing) {
            return res.status(400).json({ error: 'Already subscribed' });
        }
        
        const newSubscriber = {
            id: db.newsletter_subscribers.length + 1,
            email,
            subscribed_at: new Date().toISOString().split('T')[0],
            active: true
        };
        
        db.newsletter_subscribers.push(newSubscriber);
        await writeDatabase(db);
        
        res.status(201).json({ message: 'Successfully subscribed!' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const { name, email, message } = req.body;
        
        const newMessage = {
            id: db.contact_messages.length + 1,
            name,
            email,
            message,
            date: new Date().toISOString().split('T')[0],
            status: 'unread'
        };
        
        db.contact_messages.push(newMessage);
        await writeDatabase(db);
        
        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get website settings
app.get('/api/settings', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(db.settings);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin routes

// Get all orders (admin)
app.get('/api/admin/orders', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(db.orders);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all contact messages (admin)
app.get('/api/admin/messages', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(db.contact_messages);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark message as read (admin)
app.put('/api/admin/messages/:id/read', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const message = db.contact_messages.find(m => m.id === parseInt(req.params.id));
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        message.status = 'read';
        await writeDatabase(db);
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new product (admin)
app.post('/api/admin/products', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const { name, price, category, image, description, stock, tags } = req.body;
        
        const newProduct = {
            id: Math.max(...db.products.map(p => p.id)) + 1,
            name,
            price,
            category,
            image,
            description,
            stock,
            rating: 0,
            reviews: 0,
            tags
        };
        
        db.products.push(newProduct);
        await writeDatabase(db);
        
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update product (admin)
app.put('/api/admin/products/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const product = db.products.find(p => p.id === parseInt(req.params.id));
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        Object.assign(product, req.body);
        await writeDatabase(db);
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete product (admin)
app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        if (!db) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const productIndex = db.products.findIndex(p => p.id === parseInt(req.params.id));
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        db.products.splice(productIndex, 1);
        await writeDatabase(db);
        
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Database API endpoints available at /api/*');
}); 