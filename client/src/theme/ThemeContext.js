import React, { createContext, useContext, useState } from 'react';

const themes = {
  light: {
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      background: '#FFFFFF',
      surface: '#F2F2F7',
      text: '#000000',
      textSecondary: '#8E8E93',
      border: '#C6C6C8',
      error: '#FF3B30',
      success: '#34C759',
      warning: '#FF9500',
      white: '#FFFFFF',
      black: '#000000',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: 'bold',
      },
      h2: {
        fontSize: 24,
        fontWeight: 'bold',
      },
      h3: {
        fontSize: 20,
        fontWeight: '600',
      },
      body: {
        fontSize: 16,
        fontWeight: 'normal',
      },
      caption: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
  },
  dark: {
    colors: {
      primary: '#0A84FF',
      secondary: '#5E5CE6',
      background: '#000000',
      surface: '#1C1C1E',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
      border: '#38383A',
      error: '#FF453A',
      success: '#32D74B',
      warning: '#FF9F0A',
      white: '#FFFFFF',
      black: '#000000',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: 'bold',
      },
      h2: {
        fontSize: 24,
        fontWeight: 'bold',
      },
      h3: {
        fontSize: 20,
        fontWeight: '600',
      },
      body: {
        fontSize: 16,
        fontWeight: 'normal',
      },
      caption: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? themes.dark : themes.light;

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  React.useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem('darkMode');
        if (storedPreference !== null) {
          setIsDarkMode(JSON.parse(storedPreference));
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setThemeLoaded(true);
      }
    };

    loadThemePreference();
  }, []);

  React.useEffect(() => {
    AsyncStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, themeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};