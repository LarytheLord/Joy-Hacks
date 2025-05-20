import { DefaultTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  light: {
    fontFamily: 'System',
    fontWeight: '300',
  },
  thin: {
    fontFamily: 'System',
    fontWeight: '100',
  },
};

export const theme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366f1',
    accent: '#f59e0b',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    placeholder: '#94a3b8',
  },
  fonts: configureFonts({ config: fontConfig, isV3: false }),
};