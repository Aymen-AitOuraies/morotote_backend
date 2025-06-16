import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaTimes, FaBars, FaShoppingCart} from 'react-icons/fa';
import logo from './assets/logo.png';
import './ProductPage.css';

export default function ProductPage({ addToCart, cart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/products/${id}/`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
        
        // Set initial color if product has colors
        if (data.images && data.images.length > 0) {
          setSelectedColor(data.images[0].color || null);
        }
        
        // Set initial size if product is a T-shirt and has available sizes
        if (data.product_type === 'TSHIRT' && data.available_sizes) {
          const sizes = data.available_sizes.split(',').map(s => s.trim()).filter(s => s);
          if (sizes.length > 0) {
            setSelectedSize(sizes[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Get available colors from product images
  const availableColors = product?.images?.reduce((colors, image) => {
    if (image.color && !colors.includes(image.color)) {
      colors.push(image.color);
    }
    return colors;
  }, []) || [];

  // Get available sizes for T-shirts
  const availableSizes = product?.product_type === 'TSHIRT' && product?.available_sizes
    ? product.available_sizes.split(',').map(s => s.trim()).filter(s => s)
    : [];

  // Filter images by selected color
  const filteredImages = product?.images?.filter(image => 
    !selectedColor || image.color === selectedColor
  ) || [];

  // Reset currentImageIndex if it's out of bounds for filtered images
  useEffect(() => {
    if (filteredImages.length > 0 && currentImageIndex >= filteredImages.length) {
      setCurrentImageIndex(0);
    }
  }, [filteredImages.length, currentImageIndex]);

  const nextImage = () => {
    if (filteredImages && filteredImages.length > 0) {
      setCurrentImageIndex(prev => 
        prev === filteredImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (filteredImages && filteredImages.length > 0) {
      setCurrentImageIndex(prev => 
        prev === 0 ? filteredImages.length - 1 : prev - 1
      );
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setCurrentImageIndex(0); // Reset to first image when color changes
  };

  const handleSizeSelect = (e) => {
    setSelectedSize(e.target.value);
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
  };

  const getCurrentImageUrl = () => {
    if (!filteredImages || filteredImages.length === 0) {
      // Fallback to first available image if no filtered images
      if (product.images && product.images.length > 0) {
        const fallbackImage = product.images[0];
        return typeof fallbackImage === 'object' && fallbackImage.image 
          ? fallbackImage.image 
          : fallbackImage;
      }
      return '';
    }
    // Ensure currentImageIndex is within bounds
    const safeIndex = Math.min(currentImageIndex, filteredImages.length - 1);
    const currentImage = filteredImages[safeIndex];
    
    // Handle both API response formats
    if (typeof currentImage === 'object') {
      return currentImage.image ? currentImage.image : '';
    }
    return currentImage;
  };

  if (isLoading) return <div className="loading-message">Loading product...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!product) return <div className="error-message">Product not found</div>;

  return (
    <>
      <div className='header'>
        <img src={logo} className="logo" alt="Logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}/>
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li onClick={() => navigate('/')}>Home</li>
          <li onClick={() => navigate('/products')}>Products</li>
          <li onClick={() => navigate('/contact')}>Contact Us</li>
        </ul>
        <div className="header-right">
          <div className="cart-icon-container" onClick={() => navigate('/cart')}>
            <FaShoppingCart className="cart-icon"/>
            {cart.length > 0 && <span className="cart-badge">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>}
          </div>
          
          {isMenuOpen ? (
            <FaTimes 
              className="menu-icon" 
              onClick={() => setIsMenuOpen(false)}
            />
          ) : (
            <FaBars 
              className="menu-icon" 
              onClick={() => setIsMenuOpen(true)}
            />
          )}
        </div>
      </div>

      <div className="product-page-container">
        <div className="product-images-section">
          <div className="main-image-container">
            {filteredImages && filteredImages.length > 1 && (
              <button className="nav-button left" onClick={prevImage}>
                <FaChevronLeft />
              </button>
            )}
            
            <img 
              src={getCurrentImageUrl()}
              alt={product.title}
              className="main-product-image"
            />
            
            {filteredImages && filteredImages.length > 1 && (
              <button className="nav-button right" onClick={nextImage}>
                <FaChevronRight />
              </button>
            )}
          </div>
          
          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="color-selector">
              <h4>Available Colors:</h4>
              <div className="color-options">
                {availableColors.map(color => (
                  <button
                    key={color}
                    className={`color-option ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: getColorValue(color) }}
                    onClick={() => handleColorSelect(color)}
                    title={color.toLowerCase()}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector for T-shirts */}
          {product.product_type === 'TSHIRT' && availableSizes.length > 0 && (
            <div className="size-selector">
              <h4>Available Sizes:</h4>
              <select 
                value={selectedSize} 
                onChange={handleSizeSelect}
                className="size-select-dropdown"
              >
                {availableSizes.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filteredImages && filteredImages.length > 1 && (
            <div className="thumbnail-container">
              {filteredImages.map((img, index) => {
                const thumbnailUrl = typeof img === 'object' && img.image 
                  ? img.image 
                  : img;
                
                return (
                  <img
                    key={index}
                    src={thumbnailUrl}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="product-details">
          <h1>{product.title}</h1>
          <p className="product-type">{product.product_type === 'TOTEBAG' ? 'Totebag' : 'T-Shirt'}</p>
          <p className="product-price">${product.price}</p>
          
          <div className="full-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          <button 
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </>
  );
}

// Helper function to get CSS color values
function getColorValue(color) {
  if (!color) return '#cccccc';
  
  const colors = {
    'white': '#ffffff',
    'black': '#000000',
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#00ff00',
    'yellow': '#ffff00',
    'WHITE': '#ffffff',
    'BLACK': '#000000',
    'RED': '#ff0000',
    'BLUE': '#0000ff',
    'GREEN': '#00ff00',
    'YELLOW': '#ffff00'
  };
  
  return colors[color.toLowerCase()] || '#cccccc';
}