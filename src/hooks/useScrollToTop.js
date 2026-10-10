import { useCallback } from 'react';

const useScrollToTop = () => {
  return useCallback(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), []);
};

export default useScrollToTop;
