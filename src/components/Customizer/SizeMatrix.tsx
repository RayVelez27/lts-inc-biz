"use client";

export type Matrix = Record<string, Record<string, number>>; // colors × sizes → qty

interface Props {
  colors: string[];
  sizes: string[];
  matrix: Matrix;
  onChange: (next: Matrix) => void;
}

export default function SizeMatrix({ colors, sizes, matrix, onChange }: Props) {
  const setCell = (color: string, size: string, v: number) => {
    const next: Matrix = { ...matrix, [color]: { ...(matrix[color] ?? {}), [size]: Math.max(0, v) } };
    onChange(next);
  };

  const colorTotal = (color: string) =>
    sizes.reduce((sum, s) => sum + (matrix[color]?.[s] ?? 0), 0);

  const sizeTotal = (size: string) =>
    colors.reduce((sum, c) => sum + (matrix[c]?.[size] ?? 0), 0);

  const grandTotal = colors.reduce((sum, c) => sum + colorTotal(c), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="p-2 text-left font-medium text-navy sticky left-0 bg-white z-10">Color \ Size</th>
            {sizes.map((s) => (
              <th key={s} className="p-2 text-center font-medium text-navy min-w-[54px]">
                {s}
              </th>
            ))}
            <th className="p-2 text-center font-medium text-navy bg-cream">Row</th>
          </tr>
        </thead>
        <tbody>
          {colors.map((color) => (
            <tr key={color} className="border-t border-gray-100">
              <th className="p-2 text-left font-normal text-gray-700 sticky left-0 bg-white z-10 whitespace-nowrap">
                {color}
              </th>
              {sizes.map((size) => (
                <td key={size} className="p-1">
                  <input
                    type="number"
                    min={0}
                    value={matrix[color]?.[size] ?? 0}
                    onChange={(e) => setCell(color, size, Number(e.target.value) || 0)}
                    className="w-full text-center px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </td>
              ))}
              <td className="p-2 text-center text-sm text-gray-500 bg-cream">
                {colorTotal(color)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-300">
            <th className="p-2 text-left font-medium text-navy sticky left-0 bg-cream z-10">Col</th>
            {sizes.map((s) => (
              <td key={s} className="p-2 text-center text-sm text-gray-600 bg-cream">
                {sizeTotal(s)}
              </td>
            ))}
            <td className="p-2 text-center font-semibold text-navy bg-gold/20">{grandTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
