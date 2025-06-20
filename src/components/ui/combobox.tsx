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
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  items: { value: string; label: string }[];
  onSearch: (query: string) => void;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  value?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Combobox({
  items,
  onSearch,
  onChange,
  onFocus,
  value,
  placeholder = "Rechercher...",
  className,
  disabled = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedItem = items.find((item) => item.value === value);

  const handleSelect = React.useCallback((currentValue: string) => {
    onChange?.(currentValue);
    setOpen(false);
  }, [onChange]);

  // Trier les items pour mettre le patriarche en premier
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.label.toLowerCase().includes('patriarche')) return -1;
      if (b.label.toLowerCase().includes('patriarche')) return 1;
      return 0;
    });
  }, [items]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
            onFocus?.();
          }}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchValue}
            onValueChange={(value) => {
              setSearchValue(value);
              onSearch(value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            className="w-full"
          />
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          <CommandGroup>
            {sortedItems.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={(currentValue) => {
                  handleSelect(currentValue);
                  return false;
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
