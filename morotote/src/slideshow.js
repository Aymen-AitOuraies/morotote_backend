import React, { useState, useEffect } from 'react';
import './slideshow.css';

const Slideshow = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Create slides from products that have images
  const slides = products
    .filter(product => product.images && product.images.length > 0)
    .map(product => ({
      id: product.id,
      image: product.images[0].image, // Use the first image only
      title: product.title
    }));

  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) {
    return null; // Don't render slideshow if there are no slides
  }

  return (
    <div className="slideshow-container">
      <div className="slideshow-wrapper">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentIndex ? 'active' : ''}`}
          >
            <img src={slide.image} alt={slide.title} />
          </div>
        ))}
      </div>
      <div className="description-container">
        <p className='description'>
          Discover our unique collection of stylish t-shirts and tote bags, infused with the vibrant essence of Morocco. Each piece features bold Arabic calligraphy, intricate Berber patterns, and eye-catching geometric designs, blending modern fashion with traditional Moroccan artistry. Made for those who love expressive, culturally rich accessories, our tees and totes let you carry a piece of Morocco wherever you go—perfect for adding a touch of global flair to your everyday style!
        </p>
      </div>
    </div>
  );
};

export default Slideshow;