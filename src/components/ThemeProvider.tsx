
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <NextThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      themes={['light', 'dark']}
    >
      {children}
    </NextThemeProvider>
  );
};
