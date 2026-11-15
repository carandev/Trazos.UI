import { IconBox, type IconBoxVariant } from '@carandev/trazos-ui';
import { HeartIcon } from '../../icons';

const variants: IconBoxVariant[] = ['primary', 'lavender', 'cream', 'wine', 'neutral'];

export default function Demo() {
  return (
    <>
      {variants.map((variant) => (
        <IconBox key={variant} variant={variant} title={variant}>
          <HeartIcon />
        </IconBox>
      ))}
    </>
  );
}
