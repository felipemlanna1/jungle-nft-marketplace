import { Component } from 'react';
import type { ChildrenProps, RouteErrorState } from '../../shared-types';
import { RouteErrorFallback } from '../RouteErrorFallback';

export class RouteErrorBoundary extends Component<ChildrenProps, RouteErrorState> {
  state: RouteErrorState = { hasError: false };
  static getDerivedStateFromError(): RouteErrorState {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? <RouteErrorFallback /> : this.props.children;
  }
}
