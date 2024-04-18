"use client";

/**
 * Providers Component.
 * This component provides the ThemeProvider for the application.
 * @param children - The children of the component.
 * @returns JSX.Element - The component to be rendered.
 * @example
 * <Providers>
 *   <App />
 * </Providers>
 */
import * as React from "react";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
 
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}