import * as React from "react"
import { Star } from "lucide-react"

export function Rating({ value = 0, max = 5, readOnly = true, ...props }) {
  return (
    <div className="flex items-center gap-1" {...props}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={
            "h-5 w-5 " +
            (i < Math.round(value)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 dark:text-gray-600")
          }
          strokeWidth={1.5}
          fill={i < Math.round(value) ? "currentColor" : "none"}
        />
      ))}
    </div>
  )
}
export default Rating;
