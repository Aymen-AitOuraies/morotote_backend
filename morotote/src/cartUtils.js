// utils/cartUtils.js
export const saveCartToLocalStorage = (cart) => {
  try {
    const serializedCart = JSON.stringify(cart);
    localStorage.setItem('cart', serializedCart);
  } catch (e) {
    console.error("Could not save cart", e);
  }
};

export const loadCartFromLocalStorage = () => {
  try {
    const serializedCart = localStorage.getItem('cart');
    if (serializedCart === null) return [];
    
    const parsedCart = JSON.parse(serializedCart);
    return parsedCart.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      product_type: item.product_type,
      available_sizes: item.available_sizes,
      images: Array.isArray(item.images) ? item.images : [],
      quantity: item.quantity || 1,
      selectedSize: item.selectedSize || null,
      selectedColor: item.selectedColor || null
    }));
  } catch (e) {
    console.error("Could not load cart", e);
    return [];
  }
};

// Helper function to validate cart item options
export const validateCartItem = (item) => {
  const errors = {};
  
  // Check if T-shirt has size selected
  if (item.product_type === 'TSHIRT' && item.available_sizes) {
    const availableSizes = item.available_sizes
      .split(',')
      .map(size => size.trim())
      .filter(size => size.length > 0);
    
    if (availableSizes.length > 0 && !item.selectedSize) {
      errors.size = 'Size is required for T-shirts';
    }
  }
  
  // Check if product has color options and color is selected
  if (item.images && item.images.length > 0) {
    const availableColors = item.images
      .filter(img => img.color && img.color.trim() !== '')
      .map(img => img.color);
    
    const uniqueColors = [...new Set(availableColors)];
    if (uniqueColors.length > 0 && !item.selectedColor) {
      errors.color = 'Color selection is required';
    }
  }
  
  return errors;
};

// Helper function to get cart summary with validation status
export const getCartSummary = (cart) => {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return total + (price * item.quantity);
  }, 0);
  
  const validationErrors = {};
  let hasValidationErrors = false;
  
  cart.forEach(item => {
    const itemErrors = validateCartItem(item);
    if (Object.keys(itemErrors).length > 0) {
      validationErrors[item.id] = itemErrors;
      hasValidationErrors = true;
    }
  });
  
  return {
    totalItems,
    subtotal,
    validationErrors,
    hasValidationErrors,
    isReadyForCheckout: !hasValidationErrors && cart.length > 0
  };
};