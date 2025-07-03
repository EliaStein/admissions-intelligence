export function getBaseUrl(): string {
  // Client-side
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side - check environment variables
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.DEPLOY_URL) {
    return process.env.DEPLOY_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

export function getGoogleAuthCallbackUrl(): string {
  if (process.env.NEXT_PUBLIC_GOOGLE_AUTH_CALLBACK_URL) {
    return process.env.NEXT_PUBLIC_GOOGLE_AUTH_CALLBACK_URL;
  }

  return `${getBaseUrl()}/auth/callback`;
}


export function getBaseUrlFromRequest(request: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.DEPLOY_URL) {
    return process.env.DEPLOY_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const url = new URL(request.url);
  return url.origin;
}
