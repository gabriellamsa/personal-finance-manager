import { cn } from "@/lib/utils/cn";

const categoryColorOptions = [
  { color: "#FFD369", label: "Gold", textColor: "#222831" },
  { color: "#393E46", label: "Graphite", textColor: "#FFFFFF" },
  { color: "#5C6672", label: "Slate", textColor: "#FFFFFF" },
  { color: "#3F7D6D", label: "Emerald", textColor: "#FFFFFF" },
  { color: "#3F6E9E", label: "Blue", textColor: "#FFFFFF" },
  { color: "#7656A8", label: "Violet", textColor: "#FFFFFF" },
  { color: "#B85C45", label: "Terracotta", textColor: "#FFFFFF" },
  { color: "#B64B5A", label: "Rose", textColor: "#FFFFFF" },
] as const;

type CategoryColorPickerProps = {
  id: string;
  onChange: (color: string) => void;
  value: string;
};

export function CategoryColorPicker({
  id,
  onChange,
  value,
}: CategoryColorPickerProps) {
  const normalizedValue = value.toUpperCase();
  const isPresetColor = categoryColorOptions.some(
    (option) => option.color === normalizedValue,
  );

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card px-3.5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex shrink-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="h-10 w-10 rounded-lg border border-foreground/15"
          style={{ backgroundColor: normalizedValue }}
        />
        <div>
          <p className="text-xs font-medium text-foreground/55">Selected color</p>
          <output
            className="font-mono text-sm font-semibold tracking-wide text-foreground"
            htmlFor={id}
          >
            {normalizedValue}
          </output>
        </div>
      </div>

      <div
        aria-label="Category color palette"
        className="flex flex-wrap items-center gap-2 sm:justify-end"
        role="radiogroup"
      >
        {categoryColorOptions.map((option) => {
          const isSelected = option.color === normalizedValue;

          return (
            <button
              key={option.color}
              type="button"
              aria-checked={isSelected}
              aria-label={`Select ${option.label}`}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
                isSelected
                  ? "border-foreground ring-2 ring-accent ring-offset-2 ring-offset-card"
                  : "border-foreground/15",
              )}
              onClick={() => onChange(option.color)}
              role="radio"
              style={{
                backgroundColor: option.color,
                color: option.textColor,
              }}
              title={option.label}
            >
              {isSelected ? (
                <span aria-hidden="true" className="text-sm font-bold">
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}

        <label
          className={cn(
            "relative flex h-8 cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 text-xs font-semibold transition-colors hover:border-foreground/35 hover:bg-foreground/5",
            !isPresetColor
              ? "border-foreground bg-foreground text-white"
              : "border-foreground/25 text-foreground/65",
          )}
          htmlFor={id}
        >
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-sm border border-current"
            style={{ backgroundColor: normalizedValue }}
          />
          Custom
          <input
            id={id}
            aria-label="Choose a custom category color"
            className="absolute inset-0 cursor-pointer opacity-0"
            type="color"
            value={normalizedValue}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
          />
        </label>
      </div>
    </div>
  );
}
