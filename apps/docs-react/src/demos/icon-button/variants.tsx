import { IconButton } from '@carandev/trazos-ui';
import { PlusIcon } from '../../icons';

export default function Demo() {
  return (
    <>
      <IconButton label="Primary" variant="primary"><PlusIcon /></IconButton>
      <IconButton label="Wine" variant="wine"><PlusIcon /></IconButton>
      <IconButton label="Secondary" variant="secondary"><PlusIcon /></IconButton>
      <IconButton label="Outline" variant="outline"><PlusIcon /></IconButton>
      <IconButton label="Cream" variant="cream"><PlusIcon /></IconButton>
      <IconButton label="Lavender" variant="lavender"><PlusIcon /></IconButton>
      <IconButton label="Ghost" variant="ghost"><PlusIcon /></IconButton>
    </>
  );
}
