// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RouteErrorBoundary } from './index';

function BrokenPage(): never {
  throw new Error('A controlled render failure.');
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe('route render recovery', () => {
  it('replaces a failing page with recovery UI and does not expose exception details', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(createElement(RouteErrorBoundary, { children: createElement(BrokenPage) }));
    expect(
      screen.getByRole('heading', { name: 'Não foi possível mostrar esta página' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Recarregar página' })).toBeTruthy();
    expect(screen.queryByText('A controlled render failure.')).toBeNull();
  });
  it('recovers when the router supplies a different navigation key', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const view = render(
      createElement(RouteErrorBoundary, {
        key: 'broken-route',
        children: createElement(BrokenPage),
      }),
    );
    view.rerender(
      createElement(RouteErrorBoundary, {
        key: 'recovered-route',
        children: createElement('h1', null, 'Página disponível'),
      }),
    );
    expect(screen.getByRole('heading', { name: 'Página disponível' })).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
