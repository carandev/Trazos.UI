import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Tape, type TapeProps } from '../Tape';
import './PhotoFrame.css';

export interface PhotoFrameProps extends ComponentPropsWithRef<'figure'> {
  src: string;
  alt: string;
  /** Handwritten text below the image. */
  caption?: ReactNode;
  /** `true` pins the frame with default tape; an object sets its options. */
  tape?: boolean | TapeProps;
  /** Extra attributes for the `<img>`, such as `loading` or `width`. */
  imgProps?: Omit<ComponentPropsWithRef<'img'>, 'src' | 'alt'>;
}

/** A framed image with an offset ink shadow and a rotated backing sheet. */
export function PhotoFrame({ src, alt, caption, tape = false, imgProps, className, ...rest }: PhotoFrameProps) {
  return (
    <figure {...rest} className={cx('trazos-photo-frame', className)}>
      <div className="trazos-photo-frame-sheet">
        {tape !== false && <Tape {...(tape === true ? {} : tape)} />}
        <img {...imgProps} src={src} alt={alt} className={cx('trazos-photo-frame-image', imgProps?.className)} />
      </div>
      {caption != null && <figcaption className="trazos-handwriting trazos-photo-frame-caption">{caption}</figcaption>}
    </figure>
  );
}
