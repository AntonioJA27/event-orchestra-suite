// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// You can add other global setup code here if needed.
// For example, mocking global objects or setting up MSW (Mock Service Worker).

// Example: Mocking matchMedia for components that use it (like some UI libraries)
// This is often necessary because JSDOM doesn't implement it.
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Clean up after each test
// e.g., clear mocks, cleanup Testing Library's screen
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';

afterEach(() => {
  cleanup(); // Cleans up the DOM rendered by React Testing Library
  vi.clearAllMocks(); // Clears all mocks
});
