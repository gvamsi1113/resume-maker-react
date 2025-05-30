import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Configuration for the split layout in BentoBox
 * @typedef {Object} SplitConfig
 * @property {'horizontal' | 'vertical'} direction - Direction of the split layout
 * @property {number[]} fractions - Relative sizes of each section using fr units
 */
interface SplitConfig {
  direction: 'horizontal' | 'vertical';
  fractions: number[];
}

/**
 * Props for the BentoBox component
 * @typedef {Object} BentoBoxProps
 * @property {React.ReactNode} children - Content to render inside the box
 * @property {SplitConfig} [splitConfig] - Configuration for grid layout (when null, renders as content box)
 * @property {string} [className] - Additional CSS classes
 * @property {React.CSSProperties} [style] - Additional inline styles
 */
interface BentoBoxProps {
  children: React.ReactNode;
  splitConfig?: SplitConfig;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Content box variant - displays content in a centered, styled container
 * @param {Omit<BentoBoxProps, 'splitConfig'>} props - Component props without splitConfig
 */
const ContentBentoBox: React.FC<Omit<BentoBoxProps, 'splitConfig'>> = ({
  children,
  className,
  style
}) => {

  const combinedClassName = twMerge(
    'overflow-hidden',
    'flex flex-col justify-center items-center text-center gap-[var(--main-gap)]',
    'text-[var(--color-white)]',
    'rounded-[var(--large-rounding)]',
    'p-[var(--main-gap)]',
    !className?.includes('bg-') ? 'glassmorphism-bento' : '',
    className
  );

  return (
    <div className={combinedClassName} style={style}>
      {children}
    </div>
  );
};

/**
 * Grid layout variant - arranges children in a grid with configurable layout
 * @param {BentoBoxProps} props - Component props including splitConfig
 */
const GridBentoBox: React.FC<BentoBoxProps> = ({
  children,
  splitConfig,
  className,
}) => {
  if (!splitConfig) return null;

  const combinedClassName = twMerge(
    'overflow-hidden',
    'grid',
    'gap-[var(--main-gap)]',
    className
  );

  const gridStyle = {} as React.CSSProperties;

  const frValues = splitConfig.fractions.map(fr => `${fr}fr`).join(' ');

  if (splitConfig.direction === 'horizontal') {
    gridStyle.gridTemplateColumns = frValues;
  } else {
    gridStyle.gridTemplateRows = frValues;
  }

  return (
    <div className={combinedClassName} style={gridStyle}>
      {children}
    </div>
  );
};

/**
 * BentoBox component - A flexible container for creating card-based UIs
 * 
 * Renders as either:
 * - Content box (when splitConfig is undefined) - centers content with consistent styling
 * - Grid layout (when splitConfig is provided) - arranges children in configurable grid
 * 
 * @param {BentoBoxProps} props - Component props
 */
const BentoBox: React.FC<BentoBoxProps> = (props) => {
  const { splitConfig } = props;

  if (splitConfig) {
    return <GridBentoBox {...props} />;
  } else {
    return <ContentBentoBox {...props} />;
  }
};

export default BentoBox; 