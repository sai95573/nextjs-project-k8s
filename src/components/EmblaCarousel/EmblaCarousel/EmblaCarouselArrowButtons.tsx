/* eslint-disable max-len */
"use client";
import React, {
  ComponentPropsWithRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { EmblaCarouselType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
};

export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined,
): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

type PropType = ComponentPropsWithRef<"button"> & {
  navigationClassName?: string;
  nextButtonClassName?: string;
  prevButtonClassName?: string;
};

export const PrevButton: React.FC<PropType> = ({
  children,
  disabled,
  navigationClassName,
  prevButtonClassName,
  ...restProps
}) => {
  return (
    !disabled && (
      <button
        className={cn(
          "absolute bottom-1/2 left-0 top-1/2 z-10 flex -translate-y-1/2 cursor-pointer items-center justify-center p-3",
          prevButtonClassName,
        )}
        type="button"
        disabled={disabled}
        {...restProps}
      >
        <ChevronLeft
          strokeWidth={0.5}
          className={cn("h-14 w-14 text-black", navigationClassName)}
        />
        {children}
      </button>
    )
  );
};

export const NextButton: React.FC<PropType> = ({
  children,
  disabled,
  navigationClassName,
  nextButtonClassName,
  ...restProps
}) => {
  return (
    !disabled && (
      <button
        className={cn(
          "absolute bottom-1/2 right-0 top-1/2 z-10 flex -translate-y-1/2 cursor-pointer items-center justify-center p-3",
          nextButtonClassName,
        )}
        type="button"
        disabled={disabled}
        {...restProps}
      >
        <ChevronRight
          strokeWidth={0.5}
          className={cn("h-14 w-14 text-black", navigationClassName)}
        />
        {children}
      </button>
    )
  );
};
