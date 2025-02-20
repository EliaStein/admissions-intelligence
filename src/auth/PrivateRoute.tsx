import { withAuthenticationRequired } from '@auth0/auth0-react';
import { ComponentType } from 'react';

interface PrivateRouteProps {
  component: ComponentType;
}

export function PrivateRoute({ component }: PrivateRouteProps) {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    ),
  });

  return <Component />;
}
