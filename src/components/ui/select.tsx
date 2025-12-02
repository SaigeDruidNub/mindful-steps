import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled?: boolean;
}>({
  open: false,
  setOpen: () => {},
  disabled: false,
});

const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider
      value={{ value, onValueChange, open, setOpen, disabled }}
    >
      <div className={cn("relative", className)} data-disabled={disabled}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, disabled } = React.useContext(SelectContext);

    return (
      <button
        type="button"
        ref={ref}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, ...props }, ref) => {
    const { value } = React.useContext(SelectContext);

    return (
      <span ref={ref} className={cn("block truncate", className)} {...props}>
        {value || placeholder}
      </span>
    );
  }
);
SelectValue.displayName = "SelectValue";

const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className,
}) => {
  const { open, setOpen } = React.useContext(SelectContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
      role="listbox"
    >
      {children}
    </div>
  );
};

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, disabled = false, className, ...props }, ref) => {
    const {
      value: selectedValue,
      onValueChange,
      setOpen,
    } = React.useContext(SelectContext);
    const isSelected = value === selectedValue;

    const handleClick = () => {
      if (!disabled) {
        onValueChange?.(value);
        setOpen(false);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          isSelected && "bg-accent text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          "cursor-pointer hover:bg-accent hover:text-accent-foreground",
          className
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </span>
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
