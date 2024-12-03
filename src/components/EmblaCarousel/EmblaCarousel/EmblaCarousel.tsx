/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable consistent-return */
"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

import Autoplay from "embla-carousel-autoplay";

import useEmblaCarousel from "embla-carousel-react";
// import {
//   NextButton,
//   PrevButton,
//   usePrevNextButtons,
// } from '@/ui/EmblaCarousel/EmblaCarouselArrowButtons';
// import {
//   DotButton,
//   useDotButton,
// } from '@/ui/EmblaCarousel/EmblaCarouselDotButton';
// import {EmblaCarouselProps} from '@/ui/EmblaCarousel/types';
import { EmblaCarouselType } from "embla-carousel";
import { EmblaEventType } from "embla-carousel";
import { cn } from "@/lib/utils";
import { EmblaCarouselProps } from "./types";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

const EmblaCarousel = ({
  options,
  autoPlay = false,
  children,
  navigation,
  scale = false,
  navigationClassName,
  pagination = false,
  progress = false,
  onSlideChange,
  slides = [],
  type,
  progressClassName,
  progressBgClassName,
  prevButtonClassName,
  nextButtonClassName,
  emblaContainerClassName,
  paginationClassName,
  tweenFactorBase = 0.32,
}: React.PropsWithChildren<EmblaCarouselProps>) => {
  const plugins = autoPlay ? [Autoplay()] : [];

  const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  //tween animation
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);
  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector(".embla__slide__number") as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = tweenFactorBase * emblaApi.scrollSnapList().length;
  }, []);

  const tweenScale = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const scale = numberWithinRange(tweenValue, 0, 1).toString();
          const tweenNode = tweenNodes.current[slideIndex];
          tweenNode.style.transform = `scale(${scale})`;
        });
      });
    },
    [],
  );
  const slidesGrouped = [];
  for (let i = 0; i < slides?.length; i += 8) {
    slidesGrouped.push(slides?.slice(i, i + 8));
  }
  useEffect(() => {
    if (!emblaApi) return;

    if (scale) {
      setTweenNodes(emblaApi);
      setTweenFactor(emblaApi);
      tweenScale(emblaApi);

      emblaApi
        .on("reInit", setTweenNodes)
        .on("reInit", setTweenFactor)
        .on("reInit", tweenScale)
        .on("scroll", tweenScale)
        .on("slideFocus", tweenScale);
    }
  }, [emblaApi, tweenScale, scale]);

  //pagination progress
  const [scrollProgress, setScrollProgress] = useState(0);

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress * 100);
  }, []);
  useEffect(() => {
    if (!emblaApi) return;

    onScroll(emblaApi);
    emblaApi
      .on("reInit", onScroll)
      .on("scroll", onScroll)
      .on("slideFocus", onScroll);
  }, [emblaApi, onScroll]);
  useEffect(() => {
    if (!emblaApi) return;

    const handleSelect = () => {
      if (onSlideChange) {
        onSlideChange(emblaApi.selectedScrollSnap());
      }
    };

    emblaApi.on("select", handleSelect);
    return () => {
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi, onSlideChange]);
  return (
    <div className="embla relative">
      {type === "GRID" ? (
        <div className="embla__viewport" ref={emblaRef}>
          <div className={cn("embla__container ", emblaContainerClassName)}>
            {slidesGrouped.map((group, groupIndex) => (
              <div className="embla_grid_slide" key={groupIndex}>
                {React.Children.toArray(children)
                  .slice(groupIndex * 8, groupIndex * 8 + 8)
                  .map((child, slideIndex) => (
                    <div className="" key={slideIndex}>
                      {child}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="embla__viewport" ref={emblaRef}>
          <div className={cn("embla__container", emblaContainerClassName)}>
            {children}
          </div>
        </div>
      )}

      <div>
        {navigation && (
          <div>
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
              prevButtonClassName={prevButtonClassName}
              navigationClassName={navigationClassName}
            />
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
              nextButtonClassName={nextButtonClassName}
              navigationClassName={navigationClassName}
            />
          </div>
        )}

        {pagination && (
          <div className={cn("embla__dots", paginationClassName)}>
            {scrollSnaps.length > 1 &&
              scrollSnaps.map((_, index) => (
                <DotButton
                  key={index}
                  onClick={() => onDotButtonClick(index)}
                  className={"embla__dot".concat(
                    index === selectedIndex ? " embla__dot--selected" : "",
                  )}
                />
              ))}
          </div>
        )}
        {progress && (
          <div
            className={cn(
              "shadow-[inset_0_0_0_0.2rem_rgb(49, 49, 49);] relative m-auto h-1 w-52 max-w-[90%] self-center justify-self-center overflow-hidden rounded-full bg-black text-center",
              progressClassName,
            )}
          >
            <div
              className={cn(
                "absolute bottom-0 top-0 w-full bg-white",
                progressBgClassName,
              )}
              style={{ transform: `translate3d(${scrollProgress}%, 0, 0)` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmblaCarousel;
