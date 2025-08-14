"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


export function Combobox({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found.',
  labelKey = 'label',
  valueKey = 'value',
  className = '',
  buttonClassName = '',
  contentClassName = '',
  ...props
}) {
  const [open, setOpen] = React.useState(false);

  const getLabel = (val) => {
    if (!val) return '';
    // Try to match by valueKey
    let found = options.find((opt) => {
      if (typeof opt[valueKey] === 'object' && opt[valueKey] !== null) {
        return (
          (opt[valueKey].id && val && opt[valueKey].id === val) ||
          (opt[valueKey].name && val && opt[valueKey].name === val)
        );
      }
      return String(opt[valueKey]) === String(val);
    });
    // If not found, try to match by labelKey
    if (!found) {
      found = options.find((opt) => {
        if (typeof opt[labelKey] === 'object' && opt[labelKey] !== null) {
          return (
            (opt[labelKey].id && val && opt[labelKey].id === val) ||
            (opt[labelKey].name && val && opt[labelKey].name === val)
          );
        }
        return String(opt[labelKey]) === String(val);
      });
    }
    if (found) {
      let label = found[labelKey];
      if (typeof label === 'object' && label !== null) {
        label = label.name || label.id || '';
      }
      return label;
    }
    return '';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", buttonClassName)}
        >
          {value && getLabel(value) ? getLabel(value) : JSON.stringify(value)}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[200px] p-0", contentClassName)}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt, idx) => {
                let val = opt[valueKey];
                let label = opt[labelKey];
                return (
                  <CommandItem
                    key={String(val) + '-' + idx}
                    value={String(val)}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? '' : currentValue);
                      setOpen(false);
                    }}
                  >
                    {label}
                    <Check
                      className={cn(
                        "ml-auto",
                        String(value) === String(val) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
