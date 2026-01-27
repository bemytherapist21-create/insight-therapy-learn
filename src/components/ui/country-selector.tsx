import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Country {
  code: string;
  name: string;
}

// Convert country code to flag emoji
const getFlagEmoji = (countryCode: string): string => {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🏳️";
  }
};

interface CountrySelectorProps {
  countries: Country[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  autoDetectedCountry?: string | null;
  placeholder?: string;
}

export const CountrySelector = ({
  countries,
  value,
  onValueChange,
  disabled = false,
  autoDetectedCountry,
  placeholder = "Select country...",
}: CountrySelectorProps) => {
  const [open, setOpen] = React.useState(false);

  const selectedCountry = countries.find((c) => c.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span className="text-base leading-none">
                {getFlagEmoji(selectedCountry.code)}
              </span>
              <span>{selectedCountry.name}</span>
              {autoDetectedCountry === selectedCountry.code && (
                <span className="text-xs text-muted-foreground">(Auto)</span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 z-50 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-lg"
        align="start"
      >
        <Command className="bg-white dark:bg-slate-900">
          <CommandInput
            placeholder="Search country..."
            className="h-9 text-gray-900 dark:text-white"
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="text-gray-500 dark:text-gray-400">
              No country found.
            </CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code}`}
                  onSelect={() => {
                    onValueChange(country.code);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span className="text-base leading-none">
                    {getFlagEmoji(country.code)}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {country.name}
                  </span>
                  {autoDetectedCountry === country.code && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      (Detected)
                    </span>
                  )}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 text-primary",
                      value === country.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
