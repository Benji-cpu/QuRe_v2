import type { UserPreferences } from './UserPreferences';
import { UserPreferencesService } from './UserPreferences';

type Listener = () => void;

export class PreferencesCache {
  private static snapshot: UserPreferences | null = null;
  private static listeners: Set<Listener> = new Set();
  private static loading: Promise<UserPreferences> | null = null;

  static async loadOnce(): Promise<UserPreferences> {
    if (this.snapshot) {
      return this.snapshot;
    }
    if (this.loading) {
      return this.loading;
    }
    this.loading = (async () => {
      const prefs = await UserPreferencesService.getPreferences();
      this.snapshot = prefs;
      this.loading = null;
      return prefs;
    })();
    return this.loading;
  }

  static getSnapshot(): UserPreferences | null {
    return this.snapshot;
  }

  static subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static emit() {
    for (const l of this.listeners) {
      try {
        l();
      } catch {
        // ignore
      }
    }
  }

  static async savePartial(partial: Partial<UserPreferences>): Promise<UserPreferences> {
    let base = this.snapshot;
    if (!base) {
      base = await UserPreferencesService.getPreferences();
    }
    const merged: UserPreferences = { ...base!, ...partial };
    await UserPreferencesService.savePreferences(merged);
    this.snapshot = merged;
    this.emit();
    return merged;
  }
}


