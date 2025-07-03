export function getBaseUrl(): string {
  console.log('ENV', process.env.NODE_ENV)
  console.log('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Client-side fallback
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side fallback
  return 'http://localhost:3000';
}

export function getGoogleAuthCallbackUrl(): string {
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
