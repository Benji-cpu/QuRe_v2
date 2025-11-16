import { QRGenerator } from '../QRGenerator';

describe('QRGenerator edge cases', () => {
  it('normalizes bare domain links to https', () => {
    const c = QRGenerator.generateContent('link', { url: 'example.com' } as any);
    expect(c).toBe('https://example.com');
  });

  it('retains scheme for mailto with subject/body', () => {
    const c = QRGenerator.generateContent('email', { email: 'a@b.com', subject: 'S', message: 'M' } as any);
    expect(c.startsWith('mailto:a@b.com')).toBe(true);
    expect(c.includes('subject=')).toBe(true);
    expect(c.includes('body=')).toBe(true);
  });

  it('encodes whatsapp message', () => {
    const c = QRGenerator.generateContent('whatsapp', { phone: '+1 (555) 000', message: 'hi there' } as any);
    expect(c).toContain('wa.me/1555000');
    expect(c).toContain('text=hi%20there');
  });
});


