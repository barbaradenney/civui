import React from 'react';
import Link from '@docusaurus/Link';
import styles from './ChipNav.module.css';

interface ChipItem {
  label: string;
  href: string;
}

interface ChipNavProps {
  items: ChipItem[];
  label?: string;
}

/**
 * Tertiary in-page navigation: a horizontal strip of chip-styled
 * sibling-page links. Sits at the top of a category overview page
 * (Actions / Feedback / Layout) so readers can jump to any sibling
 * component without round-tripping through the sidebar.
 *
 * Visually mirrors the CivUI filter-chip idiom (outlined rounded
 * pills). Horizontally scrollable when the chip count overflows.
 * The wrapping `<nav>` carries `aria-label` (defaults to "Jump to
 * component") so assistive tech can identify it in the rotor.
 */
export default function ChipNav({ items, label = 'Jump to component' }: ChipNavProps) {
  return (
    <nav className={styles.nav} aria-label={label}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href} className={styles.item}>
            <Link to={item.href} className={styles.chip}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
