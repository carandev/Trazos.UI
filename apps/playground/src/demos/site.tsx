import { IconButton, LinkButton } from '@carandev/trazos-ui';
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
