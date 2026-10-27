import { Outlet } from '@tanstack/react-router';
import { Layout } from '../../../components/Layout';
import { LiveNotice } from '../../../components/LiveNotice';
import { lazy, Suspense } from 'react';
const ScenarioPanel = lazy(() =>
  import('../../../components/ScenarioPanel').then((module) => ({ default: module.ScenarioPanel })),
);
const NftPreview = lazy(() =>
  import('../../../modules/catalog/components/NftPreview').then((module) => ({
    default: module.NftPreview,
  })),
);
import { RouteErrorBoundary } from '../RouteErrorBoundary';
import { useAppShell } from './useAppShell';

export function AppShell() {
  const {
    previewNftId,
    routeKey,
    connected,
    scenariosOpen,
    setScenariosOpen,
    openScenarios,
    restoreScenarioFocus,
  } = useAppShell();
  return (
    <Layout onOpenScenarios={openScenarios}>
      <LiveNotice />
      <span
        className={`sr-only connection-dot ${connected ? 'connected' : ''}`}
        role="status"
        aria-label={connected ? 'Socket conectado' : 'Socket desconectado'}
      />
      <RouteErrorBoundary key={routeKey}>
        <Outlet />
      </RouteErrorBoundary>
      {previewNftId && (
        <Suspense
          fallback={
            <p className="sr-only" role="status">
              Carregando prévia…
            </p>
          }
        >
          <NftPreview id={previewNftId} />
        </Suspense>
      )}
      {scenariosOpen && (
        <Suspense
          fallback={
            <p className="sr-only" role="status">
              Carregando cenários…
            </p>
          }
        >
          <ScenarioPanel
            open={scenariosOpen}
            onOpenChange={setScenariosOpen}
            onCloseAutoFocus={restoreScenarioFocus}
          />
        </Suspense>
      )}
    </Layout>
  );
}
