import { navigationService } from '../NavigationService';

describe('NavigationService guard', () => {
  it('blocks duplicate navigation within window and auto-clears', async () => {
    // First navigate
    const p1 = navigationService.navigateTo('/modal/premium');
    // Immediately attempt again
    const p2 = navigationService.navigateTo('/modal/premium');
    const r1 = await p1;
    const r2 = await p2;
    expect(r1).toBe(true);
    expect(r2).toBe(false);
    // Wait for auto-clear (2s) + buffer
    await new Promise(res => setTimeout(res, 2100));
    const r3 = await navigationService.navigateTo('/modal/premium');
    expect(r3).toBe(true);
  });
});


