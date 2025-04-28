// Theme configuration for the Solana Visualizer
// Adapted to match your existing UI colors

export const darkTheme = {
    name: 'dark',
    colors: {
      primary: '#3b82f6',     // Blue (matching your existing blue buttons)
      primaryHover: '#2563eb',
      secondary: '#6366f1',   // Indigo
      secondaryHover: '#4f46e5',
      danger: '#ef4444',      // Red
      dangerHover: '#dc2626',
      accent: '#0ea5e9',      // Sky blue
      
      bgDark: '#0f172a',      // Slate 900
      bgMedium: '#1e293b',    // Slate 800
      bgLight: '#334155',     // Slate 700
      
      textPrimary: '#f8fafc',  // Slate 50
      textSecondary: '#e2e8f0', // Slate 200
      textMuted: '#94a3b8',    // Slate 400
      textInput: '#ffffff',    // White for input text
      
      border: '#475569',       // Slate 600
      borderLight: '#64748b',  // Slate 500
      borderMedium: '#334155', // Slate 700
      
      nodeWallet: '#3b82f6',   // Blue for wallets
      nodeProgram: '#10b981',  // Emerald for programs
      nodeToken: '#f59e0b',    // Amber for tokens
      nodeDefault: '#6b7280',  // Gray 500
      
      edgeDefault: '#3b82f6',  // Blue
      edgeHighlight: '#f59e0b' // Amber when highlighted
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    transitions: {
      default: 'all 0.2s ease',
      fast: 'all 0.1s ease',
    }
  };
  
  export const lightTheme = {
    name: 'light',
    colors: {
      primary: '#3b82f6',     // Blue (matching your existing blue buttons)
      primaryHover: '#2563eb',
      secondary: '#6366f1',   // Indigo
      secondaryHover: '#4f46e5',
      danger: '#ef4444',      // Red
      dangerHover: '#dc2626',
      accent: '#0ea5e9',      // Sky blue
      
      bgDark: '#f8fafc',      // Slate 50
      bgMedium: '#f1f5f9',    // Slate 100
      bgLight: '#e2e8f0',     // Slate 200
      
      textPrimary: '#1e293b',  // Slate 800
      textSecondary: '#334155', // Slate 700
      textMuted: '#64748b',    // Slate 500
      textInput: '#0f172a',    // Slate 900 for input text
      
      border: '#cbd5e1',       // Slate 300
      borderLight: '#94a3b8',  // Slate 400
      borderMedium: '#e2e8f0', // Slate 200
      
      nodeWallet: '#3b82f6',   // Blue for wallets
      nodeProgram: '#10b981',  // Emerald for programs
      nodeToken: '#f59e0b',    // Amber for tokens
      nodeDefault: '#6b7280',  // Gray 500
      
      edgeDefault: '#3b82f6',  // Blue
      edgeHighlight: '#f59e0b' // Amber when highlighted
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    transitions: {
      default: 'all 0.2s ease',
      fast: 'all 0.1s ease',
    }
  };