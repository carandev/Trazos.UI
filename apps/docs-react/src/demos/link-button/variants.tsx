import { LinkButton } from '@carandev/trazos-ui';

export default function Demo() {
  return (
    <>
      <LinkButton href="components/button" variant="primary">Primary</LinkButton>
      <LinkButton href="components/button" variant="wine">Wine</LinkButton>
      <LinkButton href="components/button" variant="secondary">Secondary</LinkButton>
      <LinkButton href="components/button" variant="outline">Outline</LinkButton>
      <LinkButton href="components/button" variant="cream">Cream</LinkButton>
      <LinkButton href="components/button" variant="lavender">Lavender</LinkButton>
      <LinkButton href="components/button" variant="ghost">Ghost</LinkButton>
    </>
  );
}
