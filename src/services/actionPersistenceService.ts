/**
 * Service to handle persistence of action parameters through authentication and purchase flows
 */
export class ActionPersistenceService {
  private static readonly ACTION_STORAGE_KEY = 'action';
  private static readonly PENDING_REQUIREMENT_STORAGE_KEY = 'pendingRequirement';

  static setItem(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  static getItem(key: string): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  static removeItem(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  static saveAction(action: string): void {
    this.setItem(this.ACTION_STORAGE_KEY, action);
  }

  static savePendingRequirement(requirement: 'credit' | 'login'): void {
    this.setItem(this.PENDING_REQUIREMENT_STORAGE_KEY, requirement);
  }

  static getAction(): string | null {
    return this.getItem(this.ACTION_STORAGE_KEY);
  }

  static getPendingRequirement(): string | null {
    return this.getItem(this.PENDING_REQUIREMENT_STORAGE_KEY);
  }

  static clearAction(): void {
    console.log('clearing action');
    this.removeItem(this.ACTION_STORAGE_KEY);
  }

  static clearPendingRequirement(): void {
    this.removeItem(this.PENDING_REQUIREMENT_STORAGE_KEY);
  }

  static shouldRedirectForAction(): { shouldRedirect: boolean; action: string | null } {
    const action = this.getAction();
    return {
      shouldRedirect: action === 'request_feedback',
      action
    };
  }
}
