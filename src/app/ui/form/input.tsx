import cn from "classnames";
import React, { InputHTMLAttributes } from "react";

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  lang: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  label?: string;
  placeholder?: string;
  name: string;
  error?: string;
  type?: string;
  shadow?: boolean;
  variant?:
    | "normal"
    | "solid"
    | "outline"
    | "authinput"
    | "signupfooter"
    | "pincode"
    | "blue";
  disabled?: boolean;
  readOnly?: boolean; // <-- Add readOnly prop
}

const classes = {
  root: `py-2 px-4 w-full appearance-none transition duration-150 ease-in-out border text-input text-13px lg:text-sm font-body placeholder-[#999999] min-h-12 text-brand-dark`,
  normal:
    "rounded bg-gray-100 border-gray-300 focus:shadow focus:text-brand-light focus:border-brand ",
  solid:
    "rounded text-brand-dark border-border-dark focus:border-2 focus:outline-none focus:border-brand h-11 md:h-12",
  authinput:
    "text-brand-dark border-r-0 border-t-0 border-l-0 pb-0 rounded-0 bg-transparent",
  outline: "rounded border-gray-300 focus:border-brand",
  shadow: "rounded focus:shadow",
  pincode: "border-b-1 text-brand-dark border-r-0 border-t-0 border-l-0",
  signupfooter:
    "rounded-lg text-brand-dark border-border-gray focus:border-2 focus:outline-none focus:border-brand h-11 md:h-12",
  disabled: "opacity-50 cursor-not-allowed",
  blue: "border-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded-lg border px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(76,134,145)] dark:text-white",
  readOnly: "cursor-not-allowed", // Add cursor style for read-only
};

const Input = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      lang,
      className = "block",
      label,
      name,
      error,
      placeholder,
      variant = "normal",
      shadow = false,
      type = "text",
      inputClassName,
      labelClassName,
      disabled,
      readOnly, // Destructure readOnly
      ...rest
    },
    ref,
  ) => {
    const rootClassName = cn(
      classes.root,
      {
        [classes.normal]: variant === "normal",
        [classes.solid]: variant === "solid",
        [classes.outline]: variant === "outline",
        [classes.authinput]: variant === "authinput",
        [classes.signupfooter]: variant === "signupfooter",
        [classes.pincode]: variant === "pincode",
        [classes.blue]: variant === "blue",
      },
      {
        [classes.shadow]: shadow,
        [classes.readOnly]: readOnly, // Apply readOnly styles if true
        [classes.disabled]: disabled, // Apply disabled styles
      },
      inputClassName,
    );

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (readOnly) {
        e.preventDefault(); // Prevent focusing the input if it's read-only
        e.target.blur(); // Remove focus programmatically
      }
    };

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={name}
            className={`mb-3 block cursor-pointer text-sm font-normal leading-none ${
              labelClassName || "text-brand-dark text-opacity-70"
            }`}
          >
            {label}
          </label>
        )}
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          placeholder={placeholder}
          className={rootClassName}
          autoComplete="off"
          spellCheck="false"
          aria-invalid={error ? "true" : "false"}
          disabled={disabled}
          readOnly={readOnly} // Pass the readOnly prop to the input
          tabIndex={readOnly ? -1 : undefined} // Disable tabbing when readOnly
          onFocus={handleFocus} // Handle focus event when readOnly
          {...rest}
        />
        {error && (
          <p className="text-13px my-2 text-rose-400 text-opacity-70">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
