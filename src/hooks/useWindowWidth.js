import { useState, useEffect } from 'react';

const useWindowWidth = () => {
  // Initialize state with the current window width (client-side only)
  // Check if 'window' is defined to support server-side rendering (SSR)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    // Function to update the width state
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener for window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []); // Empty dependency array ensures effect runs only once on mount

  return windowWidth;
};

export default useWindowWidth;