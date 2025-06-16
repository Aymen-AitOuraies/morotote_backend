import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import logo from './assets/logo.png';
import './landing_page.css';
import './cards.css';

export default function ProductsPage(props) {
    const [products, setProducts] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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
                    username: 'your_username',
                    password: 'your_password'
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

    const viewCart = () => {
        navigate('/cart');
    };

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
{/* 
            <footer className="footer">
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
        <div className="product-card">
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
                        ? `${product.description.substring(0, 40)}...` 
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
    );
}