// CartPage.js
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaArrowLeft, FaTimes, FaBars } from 'react-icons/fa';
import logo from './assets/logo.png';
import './CartPage.css'

export default function CartPage({ cart, subtotal, shippingCost, updateQuantity, removeFromCart, updateCartItemOptions }) {
  const navigate = useNavigate();
  const total = subtotal + shippingCost;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const handleRemoveItem = (item) => {
    removeFromCart(item.id, item.selectedSize, item.selectedColor);
  };
  // Handle size selection for a cart item
  const handleSizeChange = (itemId, size) => {
    updateCartItemOptions(itemId, { size });
    // Clear any previous error for this item
    setCheckoutErrors(prev => ({
      ...prev[itemId],
      size: null
    }));
  };

  // Handle color selection for a cart item
  const handleColorChange = (itemId, color) => {
    updateCartItemOptions(itemId, { color });
    // Clear any previous error for this item
    setCheckoutErrors(prev => ({
      ...prev[itemId],
      color: null
    }));
  };

  // Get available colors from product images
  const getAvailableColors = (product) => {
    if (!product.images || product.images.length === 0) return [];
    
    const colors = product.images
      .filter(img => img.color && img.color.trim() !== '')
      .map(img => img.color);
    
    // Remove duplicates
    return [...new Set(colors)];
  };

  // Get available sizes for T-shirts
  const getAvailableSizes = (product) => {
    if (product.product_type !== 'TSHIRT' || !product.available_sizes) return [];
    
    return product.available_sizes
      .split(',')
      .map(size => size.trim())
      .filter(size => size.length > 0);
  };

  // Validate cart items before checkout
  const validateCartForCheckout = () => {
    const errors = {};
    let hasErrors = false;

    cart.forEach(item => {
      const itemErrors = {};
      
      // Check if T-shirt has size selected
      if (item.product_type === 'TSHIRT') {
        const availableSizes = getAvailableSizes(item);
        if (availableSizes.length > 0 && !item.selectedSize) {
          itemErrors.size = 'Please select a size';
          hasErrors = true;
        }
      }
      
      // Check if product has color options and color is selected
      const availableColors = getAvailableColors(item);
      if (availableColors.length > 0 && !item.selectedColor) {
        itemErrors.color = 'Please select a color';
        hasErrors = true;
      }
      
      if (Object.keys(itemErrors).length > 0) {
        errors[item.id] = itemErrors;
      }
    });

    setCheckoutErrors(errors);
    return !hasErrors;
  };

  // Handle checkout button click
  const handleCheckout = () => {
    if (validateCartForCheckout()) {
      // Navigate to the checkout page
      navigate('/checkout');
    }
  };

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
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
          
          {isMenuOpen ? (
            <FaTimes className="menu-icon" onClick={() => setIsMenuOpen(false)}/>
          ) : (
            <FaBars className="menu-icon" onClick={() => setIsMenuOpen(true)}/>
          )}
        </div>
      </div>

      <div className="cart-page">
        <h2>Your Shopping Cart</h2>

        {cart.length === 0 ? (
          <div className="empty-cart-message">
            Your cart is empty. Start shopping to add items!
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-items">
              {cart.map(item => {
                const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                const availableColors = getAvailableColors(item);
                const availableSizes = getAvailableSizes(item);
                const itemErrors = checkoutErrors[item.id] || {};
                
                return (
                  <div key={item.id} className="cart-item">
                    <img 
                      src={`${item.images?.[0]?.image}`} 
                      alt={item.title}
                      className="cart-item-image"
                    />
                    <div className="cart-item-info">
                      <h3>{item.title}</h3>
                      <p className="price">Price: {itemPrice.toFixed(2)} DHS</p>
                      
                      {/* Color Selection */}
                      {availableColors.length > 0 && (
                        <div className="option-selector">
                          <label htmlFor={`color-${item.id}`}>Color:</label>
                          <select
                            id={`color-${item.id}`}
                            className={`color-selector ${itemErrors.color ? 'error' : ''}`}
                            value={item.selectedColor || ''}
                            onChange={(e) => handleColorChange(item.id, e.target.value)}
                          >
                            <option value="">Select Color</option>
                            {availableColors.map(color => (
                              <option key={color} value={color}>
                                {color.charAt(0) + color.slice(1).toLowerCase()}
                              </option>
                            ))}
                          </select>
                          {itemErrors.color && (
                            <span className="error-text">{itemErrors.color}</span>
                          )}
                        </div>
                      )}

                      {/* Size Selection for T-shirts */}
                      {item.product_type === 'TSHIRT' && availableSizes.length > 0 && (
                        <div className="option-selector">
                          <label htmlFor={`size-${item.id}`}>Size:</label>
                          <select
                            id={`size-${item.id}`}
                            className={`size-selector ${itemErrors.size ? 'error' : ''}`}
                            value={item.selectedSize || ''}
                            onChange={(e) => handleSizeChange(item.id, e.target.value)}
                          >
                            <option value="">Select Size</option>
                            {availableSizes.map(size => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                          {itemErrors.size && (
                            <span className="error-text">{itemErrors.size}</span>
                          )}
                        </div>
                      )}

                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <p className="item-total">Total: {(itemPrice * item.quantity).toFixed(2)} DHS</p>
                    </div>
                    <button 
                      className="remove-item"
                      onClick={() => handleRemoveItem(item)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal ({cart.reduce((total, item) => total + item.quantity, 0)} items)</span>
                <span>{subtotal.toFixed(2)} DHS</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shippingCost.toFixed(2)} DHS</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{total.toFixed(2)} DHS</span>
              </div>
              
              {/* Show checkout errors if any */}
              {Object.keys(checkoutErrors).length > 0 && (
                <div className="checkout-error-message">
                  Please select all required options before proceeding to checkout.
                </div>
              )}
              
              <button 
                className="checkout-button"
                onClick={handleCheckout} // Call the validation function
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}