import {EmblaOptionsType} from 'embla-carousel';
import {ReactNode} from 'react';

export type EmblaCarouselProps = {
  children: ReactNode;
  options?: EmblaOptionsType;
  autoPlay?: boolean;
  navigation?: boolean;
  pagination?: boolean;
  type?: string;
  scale?: boolean;
  slides?: number[];
  navigationClassName?: string;
  onSlideChange?: (index: number) => void;
  progress?: boolean;
  progressClassName?: string;
  progressBgClassName?: string;
  prevButtonClassName?: string;
  nextButtonClassName?: string;
  emblaContainerClassName?: string;
  tweenFactorBase?: number;
  paginationClassName?: string;
};
