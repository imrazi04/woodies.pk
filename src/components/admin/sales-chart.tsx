"use client";

import { useState } from "react";
import { formatCompactPrice, formatDay, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export type DailySales = { date: string; sales: number; orders: number };

/** Clay, one step richer than the brand token: validated for lightness, chroma and 3:1 contrast on white. */
const BAR_COLOR = "#a8572b";
const PLOT_HEIGHT = 208;
const TICK_FRACTIONS = [0, 0.25, 0.5, 0.75, 1];

/** Rounds up to a clean axis maximum (1, 2, 2.5 or 5 × a power of ten). */
function niceMax(value: number) {
  if (value <= 0) return 10_000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

/** Daily order value as a single-series column chart, with a table view of the same numbers. */
export function SalesChart({ days }: { days: DailySales[] }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [active, setActive] = useState<number | null>(null);

  const max = niceMax(Math.max(0, ...days.map((day) => day.sales)));
  const hasSales = days.some((day) => day.sales > 0);
  const peakIndex = days.reduce((best, day, index) => (day.sales > days[best].sales ? index : best), 0);
  const labelEvery = days.length > 10 ? 2 : 1;

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <div className="inline-flex rounded-lg bg-linen/70 p-0.5 text-xs font-medium" role="group" aria-label="Chart view">
          {(["chart", "table"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className={cn(
                "rounded-md px-3 py-1 capitalize transition-colors duration-300",
                view === option ? "bg-white text-espresso shadow-xs" : "text-muted hover:text-espresso",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {view === "chart" ? (
        <div className="relative flex pt-6">
          {/* Y axis */}
          <div aria-hidden className="relative w-16 shrink-0" style={{ height: PLOT_HEIGHT }}>
            {TICK_FRACTIONS.map((fraction) => (
              <span
                key={fraction}
                className="absolute right-3 translate-y-1/2 text-[11px] whitespace-nowrap text-muted tabular-nums"
                style={{ bottom: `${fraction * 100}%` }}
              >
                {formatCompactPrice(max * fraction)}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative" style={{ height: PLOT_HEIGHT }}>
              {TICK_FRACTIONS.map((fraction) => (
                <div
                  key={fraction}
                  aria-hidden
                  className={cn("absolute inset-x-0 h-px", fraction === 0 ? "bg-espresso/20" : "bg-espresso/6")}
                  style={{ bottom: `${fraction * 100}%` }}
                />
              ))}

              <ul aria-label="Daily sales" className="absolute inset-0 flex items-end">
                {days.map((day, index) => {
                  const height = (day.sales / max) * 100;
                  const isActive = active === index;
                  const align = index < 2 ? "left-0" : index > days.length - 3 ? "right-0" : "left-1/2 -translate-x-1/2";
                  return (
                    <li key={day.date} className="relative flex h-full flex-1 justify-center px-px">
                      <button
                        type="button"
                        aria-label={`${formatDay(day.date)}: ${formatPrice(day.sales)} from ${day.orders} ${day.orders === 1 ? "order" : "orders"}`}
                        onPointerEnter={() => setActive(index)}
                        onPointerLeave={() => setActive(null)}
                        onFocus={() => setActive(index)}
                        onBlur={() => setActive(null)}
                        className="group/bar flex h-full w-full items-end justify-center rounded-md focus-visible:outline-none"
                      >
                        <span
                          className={cn(
                            "block w-full max-w-6 rounded-t-[4px] transition-opacity duration-200",
                            active !== null && !isActive && "opacity-45",
                            "group-focus-visible/bar:outline-2 group-focus-visible/bar:outline-offset-2 group-focus-visible/bar:outline-espresso",
                          )}
                          style={{
                            height: day.sales > 0 ? `max(${height}%, 3px)` : 0,
                            backgroundColor: BAR_COLOR,
                          }}
                        />
                      </button>

                      {index === peakIndex && hasSales && !isActive && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[11px] font-medium whitespace-nowrap text-espresso"
                          style={{ bottom: `calc(${height}% + 6px)` }}
                        >
                          {formatCompactPrice(day.sales)}
                        </span>
                      )}

                      {isActive && (
                        <div
                          role="presentation"
                          className={cn(
                            "pointer-events-none absolute z-10 rounded-lg bg-espresso px-3 py-2 whitespace-nowrap text-cream shadow-lift",
                            align,
                          )}
                          style={{ bottom: `calc(${height}% + 10px)` }}
                        >
                          <p className="text-sm font-semibold">{formatPrice(day.sales)}</p>
                          <p className="text-[11px] text-cream/70">
                            {formatDay(day.date)} · {day.orders} {day.orders === 1 ? "order" : "orders"}
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {!hasSales && (
                <p className="absolute inset-x-0 top-1/3 text-center text-sm text-muted">No orders in this period yet.</p>
              )}
            </div>

            {/* X axis */}
            <div aria-hidden className="flex pt-2">
              {days.map((day, index) => {
                const fromEnd = days.length - 1 - index;
                return (
                  <span
                    key={day.date}
                    // Half as many date labels on phones so they don't overlap.
                    className={cn(
                      "flex-1 text-center text-[11px] whitespace-nowrap text-muted",
                      fromEnd % (labelEvery * 2) !== 0 && "max-sm:invisible",
                    )}
                  >
                    {fromEnd % labelEvery === 0 ? formatDay(day.date) : ""}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Daily sales</caption>
            <thead>
              <tr className="text-[11px] tracking-[0.12em] text-muted uppercase">
                <th scope="col" className="py-2 text-left font-semibold">
                  Day
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Orders
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Sales
                </th>
              </tr>
            </thead>
            <tbody>
              {[...days].reverse().map((day) => (
                <tr key={day.date} className="border-t border-espresso/6">
                  <td className="py-2">{formatDay(day.date)}</td>
                  <td className="py-2 text-right tabular-nums">{day.orders}</td>
                  <td className="py-2 text-right tabular-nums">{formatPrice(day.sales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
