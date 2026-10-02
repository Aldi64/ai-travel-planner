interface TransportationSummaryProps {
  data: {
    overview: string;
    options: { mode: string; description: string; tip?: string }[];
    generalTips: string[];
  };
}

export default function TransportationSummary({
  data,
}: TransportationSummaryProps) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      <p>{data.overview}</p>
      <ul>
        {data.options.map((o, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <strong>{o.mode}:</strong> {o.description}
            {o.tip && <div style={{ color: '#888' }}>Tip: {o.tip}</div>}
          </li>
        ))}
      </ul>
      {data.generalTips.length > 0 && (
        <>
          <p>
            <strong>General tips</strong>
          </p>
          <ul>
            {data.generalTips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
