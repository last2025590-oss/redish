import { useEffect } from 'react';

export function useFrameworkReady() {
  useEffect(() => {
    // Framework ready hook for Expo
    if (typeof window !== 'undefined' && window.frameworkReady) {
      window.frameworkReady();
    }
  }, []);
}
