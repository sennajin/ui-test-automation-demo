import { Page } from '@playwright/test';

/**
 * Viewport utility for responsive test handling
 * Determines if current viewport is mobile, tablet, or desktop
 * Used to adapt test behavior for different screen sizes
 */

export interface ViewportInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

/**
 * Get viewport information for current page
 * 
 * Breakpoints (matching typical Shopify themes):
 * - Mobile: < 750px width
 * - Tablet: 750px - 989px width
 * - Desktop: >= 990px width
 */
export async function getViewportInfo(page: Page): Promise<ViewportInfo> {
  const viewport = page.viewportSize();
  
  if (!viewport) {
    // Default to desktop if viewport not set
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      width: 1920,
      height: 1080
    };
  }

  const width = viewport.width;
  const isMobile = width < 750;
  const isTablet = width >= 750 && width < 990;
  const isDesktop = width >= 990;

  return {
    isMobile,
    isTablet,
    isDesktop,
    width,
    height: viewport.height
  };
}

/**
 * Check if current viewport is mobile
 */
export async function isMobileViewport(page: Page): Promise<boolean> {
  const info = await getViewportInfo(page);
  return info.isMobile;
}

/**
 * Check if current viewport is tablet
 */
export async function isTabletViewport(page: Page): Promise<boolean> {
  const info = await getViewportInfo(page);
  return info.isTablet;
}

/**
 * Check if current viewport is desktop
 */
export async function isDesktopViewport(page: Page): Promise<boolean> {
  const info = await getViewportInfo(page);
  return info.isDesktop;
}

/**
 * Execute mobile-specific action if on mobile viewport
 * @param page - Playwright page
 * @param mobileAction - Action to execute on mobile
 * @param desktopAction - Optional action to execute on desktop
 */
export async function ifMobile(
  page: Page, 
  mobileAction: () => Promise<void>,
  desktopAction?: () => Promise<void>
): Promise<void> {
  const isMobile = await isMobileViewport(page);
  
  if (isMobile) {
    await mobileAction();
  } else if (desktopAction) {
    await desktopAction();
  }
}

