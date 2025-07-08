/**
 * Service to handle persistence of action parameters through authentication and purchase flows
 */
export class ActionPersistenceService {
  private static readonly ACTION_STORAGE_KEY = 'action';

  /**
   * Save an action parameter to localStorage
   */
  static saveAction(action: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACTION_STORAGE_KEY, action);
    }
  }

  /**
   * Get the saved action parameter from localStorage
   */
  static getAction(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ACTION_STORAGE_KEY);
    }
    return null;
  }

  /**
   * Clear the saved action parameter from localStorage
   */
  static clearAction(): void {
    console.log('clearing action');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACTION_STORAGE_KEY);
    }
  }

  /**
   * Save action from URL search params to localStorage
   */
  static saveActionFromUrl(searchParams: URLSearchParams): void {
    const action = searchParams.get('action');
    if (action) {
      this.saveAction(action);
    }
  }

  /**
   * Check if there's a pending action that should trigger a redirect
   */
  static shouldRedirectForAction(): { shouldRedirect: boolean; action: string | null } {
    const action = this.getAction();
    return {
      shouldRedirect: action === 'request_feedback',
      action
    };
  }
}
