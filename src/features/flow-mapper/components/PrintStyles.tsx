export function PrintStyles() {
  return (
    <style>{`
      @media print {
        body * { visibility: hidden; }
        .flow-mapper-root, .flow-mapper-root * { visibility: visible; }
        .flow-mapper-root { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; }
        .flow-mapper-root .no-print { display: none !important; }
        .flow-mapper-root .no-print-border { border: none !important; }
      }
    `}</style>
  );
}
