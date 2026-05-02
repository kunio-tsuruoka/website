import { SUGGESTIONS } from '../constants';

type Props = {
  onPick: (text: string) => void;
  disabled: boolean;
};

export function SuggestionPills({ onPick, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          disabled={disabled}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-full hover:border-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
