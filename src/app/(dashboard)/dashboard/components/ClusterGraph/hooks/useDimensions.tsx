import { useEffect, useRef, useState, useCallback } from 'react';

export const useDimensions = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mobile-first initial dimensions
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      return {
        width: isMobile ? 320 : 800,
        height: isMobile ? 400 : 600
      };
    }
    return { width: 800, height: 600 };
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Initial measurement
    const measureInitial = () => {
      const { clientWidth, clientHeight } = containerRef.current!;
      const isMobile = window.innerWidth < 768;
      
      setDimensions({
        width: Math.max(clientWidth, isMobile ? 280 : 400),
        height: Math.max(clientHeight, isMobile ? 200 : 300)
      });
    };

    measureInitial();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const isMobile = window.innerWidth < 768;
        
        setDimensions({
          width: Math.max(width, isMobile ? 280 : 400),
          height: Math.max(height, isMobile ? 200 : 300)
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return { containerRef, dimensions };
};


export const useDimensionsResponsive = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        width: Math.min(window.innerWidth - 32, 800),
        height: Math.min(window.innerHeight * 0.6, 600)
      };
    }
    return { width: 800, height: 600 };
  });

  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Get actual available space
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Responsive minimums based on screen size
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    
    let minWidth, minHeight;
    
    if (isMobile) {
      minWidth = 280;
      minHeight = 200;
    } else if (isTablet) {
      minWidth = 400;
      minHeight = 300;
    } else {
      minWidth = 600;
      minHeight = 400;
    }
    
    setDimensions({
      width: Math.max(containerWidth - 16, minWidth),
      height: Math.max(containerHeight - 16, minHeight)
    });
  }, []);

  useEffect(() => {
    // Initial measurement after a short delay to ensure DOM is ready
    const timer = setTimeout(updateDimensions, 50);

    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        updateDimensions();
      });
    });

    resizeObserver.observe(containerRef.current);

    // Handle orientation changes on mobile
    const handleOrientationChange = () => {
      setTimeout(updateDimensions, 200); // Delay for orientation change completion
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', updateDimensions);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]);

  return { containerRef, dimensions };
};