import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import LandingPage from './landing_page';
import CartPage from './CartPage';
import ProductPage from './ProductPage';
import { loadCartFromLocalStorage, saveCartToLocalStorage } from './cartUtils';
import ProductsPage from './products_page';
import ContactPage from './ContactPage';
import CheckoutPage from './CheckoutPage';
import CheckoutSuccess from './CheckoutSuccess';

function App() {
  const [cart, setCart] = useState([]);
  const SHIPPING_COST = 0; // Fixed shipping cost

  // Load cart from localStorage on initial render
  useEffect(() => {
    const loadedCart = loadCartFromLocalStorage();
    if (loadedCart.length > 0) {
      setCart(loadedCart);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToLocalStorage(cart);
  }, [cart]);

  const addToCart = (product, selectedSize = null, selectedColor = null) => {
    setCart(prevCart => {
      // Check if this product requires size/color selection
      const requiresOptions = product.product_type === 'TSHIRT' || 
                            (product.images && product.images.some(img => img.color));

      // Find existing item with matching options
      const existingItem = prevCart.find(item => 
        item.id === product.id && 
        (!requiresOptions || (
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor
        ))
      );

      return existingItem
        ? prevCart.map(item =>
            item.id === existingItem.id 
              ? { 
                  ...item, 
                  quantity: item.quantity + 1,
                  selectedSize: selectedSize || item.selectedSize,
                  selectedColor: selectedColor || item.selectedColor
                } 
              : item
          )
        : [
            ...prevCart, 
            { 
              ...product, 
              quantity: 1,
              selectedSize,
              selectedColor
            }
          ];
    });
  };

  const updateQuantity = (productId, newQuantity, selectedSize = null, selectedColor = null) => {
    if (newQuantity < 1) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId, selectedSize = null, selectedColor = null) => {
    setCart(prevCart => 
      prevCart.filter(item => 
        !(item.id === productId && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor)
      )
    );
  };

  const updateCartItemOptions = (productId, { size, color }) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? {
              ...item,
              selectedSize: size !== undefined ? size : item.selectedSize,
              selectedColor: color !== undefined ? color : item.selectedColor
            }
          : item
      )
    );
  };

  // Calculate subtotal (sum of all items)
  const subtotal = cart.reduce((total, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return total + (price * item.quantity);
  }, 0);

  // Calculate total (subtotal + shipping)
  const total = subtotal + SHIPPING_COST;

  // Calculate total items in cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Router>
      <div className="app-container">
        <main className="app-main">
          <Routes>
            <Route 
              path="/" 
              element={
                <LandingPage 
                  cart={cart}
                  addToCart={addToCart}
                />
              } 
            />
            <Route 
              path="/products" 
              element={
                <ProductsPage 
                  cart={cart}
                  addToCart={addToCart}
                />
              } 
            />
            <Route 
              path="/cart" 
              element={
                <CartPage 
                  cart={cart}
                  subtotal={subtotal}
                  shippingCost={SHIPPING_COST}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                  updateCartItemOptions={updateCartItemOptions}
                />
              } 
            />
            <Route 
              path="/products/:id" 
              element={
                <ProductPage 
                  addToCart={addToCart}
                  cart={cart}
                />
              } 
            />
            <Route path="/contact" element={<ContactPage />} />
            <Route 
              path="/checkout" 
              element={
                <CheckoutPage 
                  cart={cart} 
                  subtotal={subtotal} 
                  shippingCost={SHIPPING_COST} 
                  total={total} 
                />
              } 
            />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;