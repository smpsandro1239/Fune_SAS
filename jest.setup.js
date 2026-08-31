import '@testing-library/jest-dom';

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
}

window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);

if (!HTMLElement.prototype.animate) {
  HTMLElement.prototype.animate = () => ({
    cancel: jest.fn(),
    finish: jest.fn(),
    pause: jest.fn(),
    play: jest.fn(),
    reverse: jest.fn(),
    updatePlaybackRate: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
}
