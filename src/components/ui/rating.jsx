import * as React from "react"
import { Star } from "lucide-react"

export function Rating({ value = 0, max = 5, readOnly = true, ...props }) {
  // value can be a float, e.g. 3.7
  return (
    <div className="flex items-center gap-1" {...props}>
      {Array.from({ length: max }).map((_, i) => {
        const fillPercent =
          value >= i + 1
            ? 1
            : value > i
            ? value - i
            : 0;
        return (
          <span key={i} className="relative inline-block h-5 w-5">
            <Star
              className="h-5 w-5 text-gray-300 dark:text-gray-600 absolute top-0 left-0"
              strokeWidth={1.5}
              fill="none"
            />
            <span
              className="absolute top-0 left-0 h-5 overflow-hidden"
              style={{ width: `${fillPercent * 100}%` }}
            >
              <Star
                className="h-5 w-5 text-yellow-400 fill-yellow-400"
                strokeWidth={1.5}
                fill="currentColor"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}
export default Rating;
