import {
  Badge,
  Button,
  Card,
  EmptyState,
  FormSection,
  IconBox,
  LoadingSpinner,
  WhatsAppButton,
  type BadgeVariant,
  type ButtonVariant,
  type IconBoxVariant,
} from '@carandev/trazos-ui';
import { useState } from 'react';
import { Demo, Row } from '../Demo';
import { ArrowIcon, BookIcon, CheckIcon, InboxIcon, PlusIcon, UsersIcon } from '../icons';

const buttonVariants: ButtonVariant[] = ['primary', 'wine', 'secondary', 'outline', 'cream', 'lavender', 'ghost'];
const badgeVariants: BadgeVariant[] = ['success', 'warning', 'error', 'info', 'lavender', 'cream', 'neutral'];
const iconBoxVariants: IconBoxVariant[] = ['primary', 'lavender', 'cream', 'wine', 'neutral'];

export function ButtonPage() {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Demo title="Variants" code={`<Button variant="primary">Save</Button>`}>
        <Row>
          {buttonVariants.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </Row>
      </Demo>
      <Demo title="Sizes" code={`<Button size="small">Small</Button>`}>
        <Row>
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </Row>
      </Demo>
      <Demo title="Icons, loading and disabled" code={`<Button loading>Saving</Button>`}>
        <Row>
          <Button leadingIcon={<PlusIcon />}>New item</Button>
          <Button variant="outline" trailingIcon={<ArrowIcon />}>
            Continue
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 1500);
            }}
          >
            {loading ? 'Saving' : 'Click to load'}
          </Button>
          <Button disabled>Disabled</Button>
        </Row>
      </Demo>
    </>
  );
}

export function BadgePage() {
  return (
    <Demo title="Variants" code={`<Badge variant="success">Active</Badge>`}>
      <Row>
        {badgeVariants.map((v) => (
          <Badge key={v} variant={v}>
            {v}
          </Badge>
        ))}
        <Badge variant="success" leadingIcon={<CheckIcon />}>
          With icon
        </Badge>
        <Badge uppercase={false}>lazytsql</Badge>
      </Row>
    </Demo>
  );
}

export function CardPage() {
  return (
    <>
      <Demo title="Default with header and footer" code={`<Card header={<h3>Title</h3>} footer={<Button>Open</Button>}>…</Card>`}>
        <div className="pg-stack">
          <Card
            header={<h3 className="trazos-heading">Weekly reading group</h3>}
            footer={
              <Button size="small" variant="outline">
                Open
              </Button>
            }
          >
            Twelve members, meets every Thursday at 7 pm.
          </Card>
        </div>
      </Demo>
      <Demo title="Lavender and interactive">
        <Row>
          <Card variant="lavender">A soft lavender card.</Card>
          <Card variant="interactive" onClick={() => undefined}>
            Hover me: interactive card.
          </Card>
        </Row>
      </Demo>
      <Demo title="Tones" code={`<Card variant="olive">…</Card>`}>
        <Row>
          <Card variant="olive">Olive</Card>
          <Card variant="gold">Gold</Card>
          <Card variant="wine">Wine</Card>
          <Card variant="sky">Sky</Card>
        </Row>
      </Demo>
      <Demo title="Media and fill" description="fill lets margin-top: auto pin a row to the bottom." code={`<Card fill media={<img src="…" alt="…" />}>…</Card>`}>
        <Row>
          <Card fill style={{ width: '14rem' }} media={<div style={{ aspectRatio: '16 / 9' }} />}>
            A cover slot above the body.
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <Button size="small" variant="outline">
                Open
              </Button>
            </div>
          </Card>
        </Row>
      </Demo>
    </>
  );
}

export function IconBoxPage() {
  return (
    <>
      <Demo title="Variants" code={`<IconBox variant="lavender"><BookIcon /></IconBox>`}>
        <Row>
          {iconBoxVariants.map((v) => (
            <IconBox key={v} variant={v}>
              <BookIcon />
            </IconBox>
          ))}
        </Row>
      </Demo>
      <Demo title="Sizes">
        <Row>
          <IconBox size="small">
            <UsersIcon />
          </IconBox>
          <IconBox size="medium">
            <UsersIcon />
          </IconBox>
          <IconBox size="large">
            <UsersIcon />
          </IconBox>
        </Row>
      </Demo>
    </>
  );
}

export function EmptyStatePage() {
  return (
    <>
      <Demo title="Default" code={`<EmptyState title="No messages yet" icon={<InboxIcon />} />`}>
        <EmptyState
          title="No messages yet"
          description="When someone writes to you, the conversation shows up here."
          icon={<InboxIcon />}
          actions={<Button leadingIcon={<PlusIcon />}>Start a conversation</Button>}
        />
      </Demo>
      <Demo title="Compact">
        <EmptyState compact title="Nothing here" description="Try another filter." icon={<InboxIcon />} iconVariant="lavender" />
      </Demo>
    </>
  );
}

export function FormSectionPage() {
  return (
    <Demo title="Numbered steps" code={`<FormSection step={1} title="Contact details">…</FormSection>`}>
      <div className="pg-stack">
        <FormSection step={1} title="Contact details" description="How we can reach you.">
          <p>Form fields go here.</p>
        </FormSection>
        <FormSection step={2} title="Preferences">
          <p>More fields.</p>
        </FormSection>
      </div>
    </Demo>
  );
}

export function LoadingSpinnerPage() {
  return (
    <>
      <Demo title="Inline" code={`<LoadingSpinner message="Loading flows…" />`}>
        <LoadingSpinner message="Loading flows…" />
      </Demo>
      <Demo title="Overlay" description="Covers the nearest positioned ancestor.">
        <div style={{ position: 'relative', minHeight: 160 }}>
          <p>Content behind the overlay.</p>
          <LoadingSpinner overlay message="Saving" />
        </div>
      </Demo>
    </>
  );
}

export function WhatsAppButtonPage() {
  return (
    <Demo title="Default" description="Opens wa.me with the country code added when missing." code={`<WhatsAppButton phoneNumber="300 123 4567" showPhone />`}>
      <Row>
        <WhatsAppButton phoneNumber="300 123 4567" />
        <WhatsAppButton phoneNumber="300 123 4567" showPhone />
      </Row>
    </Demo>
  );
}
