/**
 * Type declarations for assets & CSS imports
 * Needed for TypeScript to understand CSS module imports
 */

// CSS modules (contoh: animated-icon.module.css)
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Global CSS side-effect import (contoh: import './global.css')
declare module '*.css';

// Static assets (jika belum ada)
declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const value: any;
  export default value;
}

declare module '*.gif' {
  const value: any;
  export default value;
}
