import { Capacitor } from '@capacitor/core';

// Utility functions for Capacitor
export const isNative = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// Deep link handling
export const handleDeepLink = (url: string) => {
  console.log('Deep link received:', url);
  
  // Extract path from deep link
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  
  // Navigate to the appropriate route
  if (path && window.location.pathname !== path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
};

// Initialize deep link listener
export const initializeDeepLinks = () => {
  if (isNative()) {
    // Listen for deep links in native apps
    document.addEventListener('deviceready', () => {
      // This will be handled by the native layer
      console.log('Device ready for deep links');
    });
  }
};