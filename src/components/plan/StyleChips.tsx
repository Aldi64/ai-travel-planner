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
    <div>
      {STYLES.map((s) => (
        <button
          type="button"
          key={s}
          onClick={() => toggle(s)}
          style={{
            marginRight: 8,
            padding: '4px 12px',
            borderRadius: 12,
            border: value.includes(s) ? '2px solid #333' : '1px solid #ccc',
            background: value.includes(s) ? '#eee' : 'white',
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
