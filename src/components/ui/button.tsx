"use client";

import cn from "classnames";
import Image from "next/image";
import { forwardRef, ButtonHTMLAttributes } from "react";
import { ImSpinner2 } from "react-icons/im";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?:
    | "primary"
    | "border"
    | "formButton"
    | "plp-loadmore-btn"
    | "realted-prod-pdp"
    | "storeButton"
    | "storeborder"
    | "signupfooter";
  active?: boolean;
  type?: "submit" | "reset" | "button";
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: any;
  leftIconClassName?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    className,
    variant = "primary",
    children,
    active,
    loading = false,
    disabled = false,
    leftIcon,
    leftIconClassName,
    type,
    ...rest
  } = props;

  const rootClassName = cn(
    "group text-[13px] md:text-sm lg:text-15px leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-body font-semibold text-center justify-center tracking-[0.2px] rounded placeholder-white focus-visible:outline-none focus:outline-none",
    {
      // "h-12 md:h-12 bg-brand text-brand-light tracking-widest px-5 md:px-6 lg:px-8 py-4 md:py-3.5 lg:py-4 hover:text-white hover:bg-opacity-100":
      //   variant === "primary",
      // "h-12 md:h-12 text-brand-dark border rounded-xl border-border-four tracking-widest px-5 md:px-6 lg:px-8 py-4 md:py-3.5 lg:py-4":
      //   variant === "border",

      // "h-12 md:h-14 bg-brand-light border-2 border-brand-customDarkGreen text-brand-customDarkGreen border border-border-four tracking-widest px-5 md:px-6 lg:px-8 py-4 md:py-3.5 lg:py-4":
      //   variant === "storeborder",
      // "h-12 md:h-14 bg-brand-customDarkGreen text-white font-manrope px-5 lg:px-6 py-4 md:py-3.5 lg:py-4 hover:text-white hover:bg-opacity-90 focus:bg-opacity-70":
      //   variant === "storeButton",

      // "h-11 md:h-[50px] bg-brand text-brand-light font-manrope px-5 lg:px-6 py-4 md:py-3.5 lg:py-4 hover:text-white hover:bg-opacity-90 focus:bg-opacity-70":
      //   variant === "formButton",

      // "h-12 md:h-14 bg-white text-brand-primary rounded-lg border-2 border-brand-primary tracking-widest px-5 md:px-9 lg:px-12 hover:bg-[#038678] hover:text-brand-light hover:border-0 py-4 md:py-3.5 lg:py-4 w-[250px] lg:w-[295px]":
      //   variant === "plp-loadmore-btn",
      // "h-10 md:h-10 bg-brand text-brand-light tracking-widest px-2 md:px-2 lg:px-2 py-4 md:py-3 lg:py-3 hover:text-white hover:bg-opacity-100":
      //   variant === "realted-prod-pdp",
      // "cursor-not-allowed hover:cursor-not-allowed bg-opacity-50 hover:bg-opacity-50":
      //   disabled,
      "h-11 md:h-[16px] bg-[#1C2434] rounded-lg text-white font-manrope px-5 lg:px-6 py-4 md:py-3.5 lg:py-6 hover:text-white hover:bg-opacity-90 focus:bg-opacity-70":
        variant === "signupfooter",
    },
    className,
  );

  return (
    <button
      aria-pressed={active}
      data-variant={variant}
      ref={ref}
      className={rootClassName}
      disabled={disabled}
      type={type}
      {...rest}
    >
      {leftIcon && (
        <Image src={leftIcon} alt="name" className={cn(leftIconClassName)} />
      )}
      {children}
      {loading && (
        <ImSpinner2 className="ml-2 h-5 w-5 animate-spin ltr:-mr-1 ltr:ml-3 rtl:-ml-1 rtl:mr-3 " />
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
