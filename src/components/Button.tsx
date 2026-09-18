import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { MetalFx } from 'metal-fx';
import type { MetalFxProps } from 'metal-fx';
import { useDocumentTheme } from '../hooks/useDocumentTheme';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary';
type Size = 'md' | 'sm';

type CommonProps = {
  variant?: Variant;
  size?: Size;
  /** Wrap the button in metal-fx's animated liquid-metal ring. */
  metal?: boolean;
  /**
   * Neighbouring elements that catch a soft reflection of the ring. Dark
   * surfaces only — metal-fx skips the work entirely on light ones.
   */
  reflectionTargets?: MetalFxProps['reflectionTargets'];
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    as?: 'button';
  };

type ButtonAsAnchor = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
    as: 'a';
    href: string;
  };

type Props = ButtonAsButton | ButtonAsAnchor;

function classNames(variant: Variant, size: Size, extra?: string) {
  const parts = [styles.btn, styles[variant]];
  if (size === 'sm') parts.push(styles.sm);
  if (extra) parts.push(extra);
  return parts.join(' ');
}

export function Button(props: Props) {
  const {
    variant = 'primary',
    size = 'md',
    metal = false,
    reflectionTargets,
    children,
    className,
    ...rest
  } = props as Props & {
    className?: string;
  };
  const theme = useDocumentTheme();
  const cls = classNames(variant, size, className);

  let element: ReactNode;

  if (props.as === 'a') {
    const { as: _as, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      as?: 'a';
    };
    element = (
      <a className={cls} {...anchorRest}>
        {children}
      </a>
    );
  } else {
    const { as: _as, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement> & {
      as?: 'button';
    };
    element = (
      <button type="button" className={cls} {...buttonRest}>
        {children}
      </button>
    );
  }

  if (!metal) return <>{element}</>;

  // metal-fx owns the visible surface: it forces `background: transparent` on
  // the wrapped child and paints its own (#ffffff in light mode), which is why
  // the button has to hand its gradient up to the wrapper — otherwise the pill
  // renders white and the white label disappears into it.
  //
  // The theme is inverted on purpose. `--gradient-btn-primary` is dark on the
  // light site and light on the dark one, and metal-fx tunes the shader for the
  // surface it sits on, not for the page. Passing the site theme straight
  // through gives the ring the wrong backdrop and washes it out.
  const onDarkSurface = variant === 'primary' ? theme === 'light' : theme === 'dark';

  return (
    <MetalFx
      variant="button"
      preset="chromatic"
      theme={onDarkSurface ? 'dark' : 'light'}
      // The `button` variant's baseline ring is 1px, which barely reads on a
      // pill this size. 2px is still a hairline but you can actually see it move.
      ringCssPx={2}
      innerShadow
      reflectionTargets={reflectionTargets}
      className={styles.metal}
      style={
        variant === 'primary'
          ? {
              backgroundColor: 'var(--color-btn-primary-fill)',
              backgroundImage: 'var(--gradient-btn-primary)',
            }
          : { background: 'transparent' }
      }
    >
      {element}
    </MetalFx>
  );
}
