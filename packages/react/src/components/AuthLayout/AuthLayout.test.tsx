import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { AuthLayout } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('AuthLayout', () => {
  it('renders brand, title, subtitle, children and footer', () => {
    render(
      <AuthLayout brand={<span>Acme</span>} title="Sign in" subtitle="Welcome back" footer={<a href="/forgot">Forgot your password?</a>}>
        <p>Form</p>
      </AuthLayout>,
    );

    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Form')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Forgot your password?' })).toBeInTheDocument();
  });

  it('omits the title element when no title is given', () => {
    render(
      <AuthLayout>
        <p>Form</p>
      </AuthLayout>,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('omits the subtitle element when no subtitle is given', () => {
    const { container } = render(
      <AuthLayout>
        <p>Form</p>
      </AuthLayout>,
    );
    expect(container.querySelector('.trazos-auth-layout-subtitle')).not.toBeInTheDocument();
  });

  it('renders the footer outside the card, not inside its body', () => {
    const { container } = render(
      <AuthLayout footer={<a href="/forgot">Forgot your password?</a>}>
        <p>Form</p>
      </AuthLayout>,
    );
    const card = container.querySelector('.trazos-card-box');
    const footer = container.querySelector('.trazos-auth-layout-footer');
    expect(footer).not.toBeNull();
    expect(card?.contains(footer)).toBe(false);
    expect(footer).toHaveTextContent('Forgot your password?');
  });

  it('forwards the ref, classes and native attributes to the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AuthLayout ref={ref} className="extra" data-x="1">
        <p>Form</p>
      </AuthLayout>,
    );
    expect(ref.current).toHaveClass('trazos-auth-layout', 'extra');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AuthLayout title="Sign in" subtitle="Welcome back" footer={<a href="/forgot">Forgot your password?</a>}>
        <p>Form</p>
      </AuthLayout>,
    );
    await expectNoA11yViolations(container);
  });
});
