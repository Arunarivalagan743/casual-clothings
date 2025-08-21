import { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state.user);
  const location = useLocation();

  // Check if current page is one of checkout-related pages
  const isCheckoutPage = ['/bag', '/address', '/payment', '/checkout'].some(path => 
    location.pathname.includes(path)
  );

  // Check if cart should be shown (user logged in and has items, not on checkout pages)
  const shouldShowCart = user?._id && cartItem.length > 0 && !isCheckoutPage;

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={`fixed right-4 z-30 bg-black hover:bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-gray-700 transition-all duration-300 hover:scale-110 animate-fadeIn lg:bottom-20 ${
            shouldShowCart ? 'bottom-28' : 'bottom-20'
          }`}
          aria-label="Scroll to top"
        >
          <FaArrowUp size={16} />
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;
