const STYLES = ['relaxing', 'adventure', 'cultural'];

export default function StyleChips({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(style: string) {
    if (value.includes(style)) {
      onChange(value.filter((s) => s !== style));
    } else if (value.length < 3) {
      onChange([...value, style]);
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {STYLES.map((s) => {
        const active = value.includes(s);
        return (
          <button
            type="button"
            key={s}
            onClick={() => toggle(s)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              active
                ? 'bg-ink text-paper border-ink'
                : 'border-ink/25 text-ink/70 hover:border-ink/50'
            }`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}
