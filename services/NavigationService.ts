import { router } from 'expo-router';

class NavigationService {
  private static instance: NavigationService;
  private isNavigating: boolean = false;
  private navigationTimeout: ReturnType<typeof setTimeout> | null = null;
  private activeModals: Set<string> = new Set();
  private modalTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  private constructor() {}

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  /**
   * Navigate to a route with protection against duplicate navigations
   */
  async navigateTo(path: string): Promise<boolean> {
    // Extract the modal name from the path
    const modalName = path.split('?')[0];
    
    // Check if we're already navigating or if this modal is already active
    if (this.isNavigating || this.activeModals.has(modalName)) {
      if (__DEV__) {
        console.log(`Navigation blocked: ${this.isNavigating ? 'Already navigating' : 'Modal already active'} - ${path}`);
      }
      return false;
    }

    // Set navigation lock
    this.isNavigating = true;
    this.activeModals.add(modalName);
    // Safety auto-clear in case a caller forgets to clear on close
    const existing = this.modalTimeouts.get(modalName);
    if (existing) {
      clearTimeout(existing);
    }
    const t = setTimeout(() => {
      this.activeModals.delete(modalName);
      this.modalTimeouts.delete(modalName);
    }, 2000);
    this.modalTimeouts.set(modalName, t);

    // Clear any existing timeout
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }

    try {
      // Perform the navigation
      router.push(path as any);

      // Set a timeout to reset the navigation lock
      // This prevents the lock from getting stuck if navigation fails
      this.navigationTimeout = setTimeout(() => {
        this.isNavigating = false;
      }, 500);

      return true;
    } catch (error) {
      console.error('Navigation error:', error);
      this.isNavigating = false;
      this.activeModals.delete(modalName);
      return false;
    }
  }

  /**
   * Navigate to premium modal with duplicate protection
   */
  async navigateToPremium(): Promise<boolean> {
    return this.navigateTo('/modal/premium');
  }

  /**
   * Clear navigation state when modal is closed
   */
  clearModalState(modalName: string) {
    this.activeModals.delete(modalName);
    this.isNavigating = false;
    const t = this.modalTimeouts.get(modalName);
    if (t) {
      clearTimeout(t);
      this.modalTimeouts.delete(modalName);
    }
  }

  /**
   * Reset all navigation states
   */
  reset() {
    this.isNavigating = false;
    this.activeModals.clear();
    for (const t of this.modalTimeouts.values()) {
      clearTimeout(t);
    }
    this.modalTimeouts.clear();
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
      this.navigationTimeout = null;
    }
  }
}

export const navigationService = NavigationService.getInstance(); 