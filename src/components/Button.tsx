import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary';
type Size = 'md' | 'sm';

type CommonProps = {
  variant?: Variant;
  size?: Size;
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
  const { variant = 'primary', size = 'md', children, className, ...rest } = props as Props & {
    className?: string;
  };
  const cls = classNames(variant, size, className);

  if (props.as === 'a') {
    const { as: _as, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      as?: 'a';
    };
    return (
      <a className={cls} {...anchorRest}>
        {children}
      </a>
    );
  }

  const { as: _as, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button';
  };
  return (
    <button type="button" className={cls} {...buttonRest}>
      {children}
    </button>
  );
}
