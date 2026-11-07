import {
  Card,
  IconButton,
  LinkButton,
  PhotoFrame,
  SectionHeading,
  SketchArrow,
  SketchCircle,
  SketchSquiggle,
  SketchUnderline,
  Tape,
} from '@carandev/trazos-ui';
import { Demo, Row } from '../Demo';
import { ArrowIcon, PlusIcon } from '../icons';

export function LinkButtonPage() {
  return (
    <Demo title="Variants and icons" code={`<LinkButton href="/cv.pdf" variant="wine" trailingIcon={<ArrowIcon />}>Resume</LinkButton>`}>
      <Row>
        <LinkButton href="#">Primary</LinkButton>
        <LinkButton href="#" variant="wine" trailingIcon={<ArrowIcon />}>
          Resume
        </LinkButton>
        <LinkButton href="#" variant="outline" size="small">
          Small outline
        </LinkButton>
      </Row>
    </Demo>
  );
}

export function IconButtonPage() {
  return (
    <Demo title="Variants and sizes" code={`<IconButton label="Add" variant="outline"><PlusIcon /></IconButton>`}>
      <Row>
        <IconButton label="Add">
          <PlusIcon />
        </IconButton>
        <IconButton label="Add" variant="outline">
          <PlusIcon />
        </IconButton>
        <IconButton label="Add" variant="primary" size="large">
          <PlusIcon />
        </IconButton>
        <IconButton label="Add" variant="wine" loading>
          <PlusIcon />
        </IconButton>
      </Row>
    </Demo>
  );
}

const photo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Crect width='240' height='180' fill='%23C7E0D1'/%3E%3Ccircle cx='120' cy='80' r='36' fill='%236FB08F'/%3E%3C/svg%3E";

export function SketchPage() {
  return (
    <Demo title="Strokes" description="Remount the page to replay the animated ones." code={`<SketchUnderline animated />`}>
      <div className="pg-stack" style={{ maxWidth: '20rem' }}>
        <SketchUnderline />
        <SketchUnderline animated color="var(--trazos-olive)" />
        <SketchCircle animated />
        <SketchArrow animated style={{ width: '5rem' }} />
        <SketchSquiggle />
      </div>
    </Demo>
  );
}

export function TapePage() {
  return (
    <Demo title="Positions" description="Hover a card to tilt its tape." code={`<Card style={{ position: 'relative' }}><Tape position="top-left" /></Card>`}>
      <Row>
        {(['top-left', 'top', 'top-right'] as const).map((position) => (
          <Card key={position} style={{ position: 'relative', width: '12rem' }}>
            <Tape position={position} />
            {position}
          </Card>
        ))}
        <Card style={{ position: 'relative', width: '12rem' }}>
          <Tape color="rgba(199, 224, 209, 0.8)" rotate={4} />
          Custom color
        </Card>
      </Row>
    </Demo>
  );
}

export function PhotoFramePage() {
  return (
    <Demo title="With tape and caption" code={`<PhotoFrame src="/me.jpg" alt="Portrait" caption="Hi there" tape />`}>
      <Row>
        <PhotoFrame src={photo} alt="Placeholder portrait" caption="Hi there" tape style={{ width: '14rem' }} />
        <PhotoFrame src={photo} alt="Placeholder portrait" style={{ width: '10rem' }} />
      </Row>
    </Demo>
  );
}

export function SectionHeadingPage() {
  return (
    <Demo title="Eyebrow, underline and actions" code={`<SectionHeading eyebrow="What I build" title="Projects" underline actions={…} />`}>
      <SectionHeading
        eyebrow="What I build"
        title="Projects"
        underline
        actions={
          <LinkButton href="#" variant="outline" size="small">
            See all
          </LinkButton>
        }
      />
    </Demo>
  );
}
