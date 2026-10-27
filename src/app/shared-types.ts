import type { ReactNode } from 'react';
export interface ChildrenProps {
  children: ReactNode;
}
export interface RouteErrorState {
  hasError: boolean;
}
export type SessionAccess = 'loading' | 'unavailable' | 'guest' | 'authenticated';
