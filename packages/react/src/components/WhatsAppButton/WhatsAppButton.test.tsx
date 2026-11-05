import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { WhatsAppButton } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('WhatsAppButton', () => {
  it('renders a wa.me link opening in a new tab with the icon only', () => {
    const { container } = render(<WhatsAppButton phoneNumber="300 123 4567" />);
    const link = screen.getByRole('link', { name: 'Enviar mensaje por WhatsApp' });
    expect(link).toHaveAttribute('href', 'https://wa.me/573001234567');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('title', 'Enviar mensaje por WhatsApp');
    expect(link).toHaveClass('whatsapp-btn');
    expect(link.querySelector('svg.whatsapp-icon')).not.toBeNull();
    expect(container.querySelector('span')).toBeNull();
  });

  it('renders nothing without a phone number', () => {
    const { container } = render(<WhatsAppButton phoneNumber="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ['+57 300-123-4567', '57', 'https://wa.me/573001234567'],
    ['(300) 123 4567', '57', 'https://wa.me/573001234567'],
    ['0300 123 4567', '57', 'https://wa.me/573001234567'],
    ['00573001234567', '57', 'https://wa.me/570573001234567'],
    ['573001234567', '57', 'https://wa.me/573001234567'],
    ['612 345 678', '34', 'https://wa.me/34612345678'],
    ['+34 612 345 678', '34', 'https://wa.me/34612345678'],
    ['abc', '57', 'https://wa.me/57'],
    ['٣٠٠', '57', 'https://wa.me/57٣٠٠'],
  ])('builds the link for %s with country code %s', (phone, code, href) => {
    render(<WhatsAppButton phoneNumber={phone} defaultCountryCode={code} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', href);
  });

  it('shows the phone number as typed when showPhone is set', () => {
    render(<WhatsAppButton phoneNumber="300 123 4567" showPhone />);
    expect(screen.getByRole('link')).toHaveTextContent('300 123 4567');
  });

  it('forwards the ref, extra classes and native attributes, and allows a custom title', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <WhatsAppButton ref={ref} phoneNumber="3001234567" className="extra" data-x="1" title="Send a WhatsApp message" />,
    );
    const link = screen.getByRole('link', { name: 'Send a WhatsApp message' });
    expect(ref.current).toBe(link);
    expect(link).toHaveClass('whatsapp-btn', 'extra');
    expect(link).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<WhatsAppButton phoneNumber="3001234567" />);
    await expectNoA11yViolations(container);
  });
});
