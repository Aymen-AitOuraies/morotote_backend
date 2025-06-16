import { useEffect, useState } from 'react';
import logo from './assets/logo.png';
import './landing_page.css';
import './slideshow.css';
import './cards.css';
import Slideshow from './slideshow';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function LandingPage(props) {
    const [products, setProducts] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [token, setToken] = useState(null);
    const navigate = useNavigate();
    const { cart, addToCart } = props;

const login = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'your_username',  // replace with actual username
                password: 'your_password'   // replace with actual password
            })
        });
        const data = await response.json();
        setToken(data.token);
    } catch (error) {
        console.error('Login failed:', error);
    }
};
useEffect(() => {
    login();
}, []);
    // const addToCart = (product) => {
    //     setCart(prevCart => {
    //         const existingItem = prevCart.find(item => item.id === product.id);
    //         if (existingItem) {
    //             return prevCart.map(item =>
    //                 item.id === product.id 
    //                     ? { ...item, quantity: item.quantity + 1 } 
    //                     : item
    //             );
    //         }
    //         return [...prevCart, { ...product, quantity: 1 }];
    //     });
    // };

    const viewCart = () => {
        navigate('/cart');
    };


    // const removeFromCart = (productId) => {
    //     setCart(prevCart => prevCart.filter(item => item.id !== productId));
    // };

    // const updateQuantity = (productId, newQuantity) => {
    //     if (newQuantity < 1) return;
    //     setCart(prevCart =>
    //         prevCart.map(item =>
    //             item.id === productId ? { ...item, quantity: newQuantity } : item
    //         )
    //     );
    // };

const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(product => {
        if (filter === 'totebags') {
            return product.product_type === 'TOTEBAG';
        } else if (filter === 'shirts') {
            return product.product_type === 'TSHIRT';
        }
        return (
            product.title.toLowerCase().includes(filter.toLowerCase()) ||
            product.description.toLowerCase().includes(filter.toLowerCase())
        );
    });

useEffect(() => {
    const fetchProducts = async () => {
        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }
            
            const response = await fetch('http://localhost:8000/api/products/', {
                headers
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            
            const data = await response.json();
            setProducts(data.results || data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    fetchProducts();
}, [token]);

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <>
            <div className='header'>
                <img src={logo} className="logo" alt="Logo"/>
                <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <li onClick={() => navigate('/')}>Home</li>
                              <li onClick={() => navigate('/products')}>Products</li>
          <li onClick={() => navigate('/contact')}>Contact Us</li>
                </ul>
                <div className="header-right">
                    <div className="cart-icon-container" onClick={viewCart}>
                        <FaShoppingCart className="cart-icon"/>
                        {cart.length > 0 && <span className="cart-badge">
                        {cart.reduce((total, item) => total + item.quantity, 0)}
                        </span>}
                    </div>
                    {isMenuOpen ? (
                        <FaTimes className="menu-icon" onClick={() => setIsMenuOpen(false)}/>
                    ) : (
                        <FaBars className="menu-icon" onClick={() => setIsMenuOpen(true)}/>
                    )}
                </div>
            </div>

            <Slideshow products={products} />

            <div className='content'>
                <div className='container'>
                    <div className='filter'>
                        <span 
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            All Products
                        </span>
                        <span 
                            className={filter === 'totebags' ? 'active' : ''}
                            onClick={() => setFilter('totebags')}
                        >
                            Totebags
                        </span>
                        <span 
                            className={filter === 'shirts' ? 'active' : ''}
                            onClick={() => setFilter('shirts')}
                        >
                            Shirts
                        </span>
                    </div>

                    <div className='products-grid'>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onAddToCart={() => addToCart(product)}
                                />
                            ))
                        ) : (
                            <div className="no-products">No products found matching your criteria.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h3>Your Cart</h3>
                    <FaTimes className="close-cart" onClick={() => setIsCartOpen(false)}/>
                </div>
                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart">Your cart is empty</div>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <img 
                                        src={`http://localhost:8000${item.images?.[0]?.image}`} 
                                        alt={item.title}
                                        className="cart-item-image"
                                    />
                                    <div className="cart-item-details">
                                        <h4>{item.title}</h4>
                                        <p>${item.price}</p>
                                        <div className="quantity-controls">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        className="remove-item"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <div className="cart-total">
                                <span>Total:</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <button className="checkout-btn">Proceed to Checkout</button>
                        </>
                    )}
                </div>
            </div>
            {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>}*/ }
        {/* <footer className="footer">
    <p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
</footer> */}
        </>
    );
}

function ProductCard({ product, onAddToCart }) {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const handleAddToCart = () => {
        setIsAdding(true);
        onAddToCart(product);
        setTimeout(() => setIsAdding(false), 1000);
    };

    return (
        <>
        <div className="product-card" >
            <div className="image-container" onClick={() => navigate(`/products/${product.id}`)}>
                {product.images?.length > 0 && (
                    <img 
                        src={`${product.images[0].image}`} 
                        alt={product.title}
                        className="product-image"
                        loading="lazy"
                    />
                )}
            </div>
            <div className="product-info" onClick={() => navigate(`/products/${product.id}`)}>
                <p className="product-type">
                    {product.product_type === 'TOTEBAG' ? 'Totebag' : 'T-Shirt'}
                </p>
                <h3 className="product-title">{product.title}</h3>
                <p className="product-price">${product.price}</p>
                <p className="product-description">
                    {product.description.length > 100 
                        ? `${product.description.substring(0,30)}...` 
                        : product.description}
                </p>
            </div>
                <button 
                    className="add-to-cart"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                >
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                </button>
        </div>
        
        </>
    );
}