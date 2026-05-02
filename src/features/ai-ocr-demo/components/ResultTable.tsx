import type { OcrResult } from '../types';

export function ResultTable({ result }: { result: OcrResult }) {
  const rows: Array<[string, string]> = [
    ['店舗名', result.vendor ?? '—'],
    ['日付', result.date ?? '—'],
    ['合計', result.total != null ? `¥${result.total.toLocaleString()}` : '—'],
    ['小計', result.subtotal != null ? `¥${result.subtotal.toLocaleString()}` : '—'],
    ['消費税', result.tax != null ? `¥${result.tax.toLocaleString()}` : '—'],
    ['支払方法', result.payment ?? '—'],
  ];
  return (
    <div className="space-y-3">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-gray-100 last:border-0">
              <th className="text-left text-gray-600 font-normal py-2 w-24">{k}</th>
              <td className="py-2 font-medium">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {result.items && result.items.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">明細</p>
          <ul className="text-sm space-y-1 bg-gray-50 rounded-xl p-3">
            {result.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>{item.name}</span>
                <span className="text-gray-600">¥{item.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.note && (
        <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">備考: {result.note}</p>
      )}
    </div>
  );
}
