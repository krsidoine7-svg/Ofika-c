"use client"

import * as React from "react"
import { addDays } from "date-fns"
import { type DateRange } from "react-day-picker"
import { Calendar } from "@/components/core/ui/calendar"
import { Card, CardContent } from "@/components/core/ui/card"

interface CalendarRangeProps {
  selected?: DateRange
  onSelect?: (range: DateRange | undefined) => void
}

export function CalendarRange({ selected, onSelect }: CalendarRangeProps) {
  const [internalRange, setInternalRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  })

  const dateValue = selected !== undefined ? selected : internalRange
  const handleSelect = onSelect !== undefined ? onSelect : setInternalRange

  return (
    <Card className="mx-auto w-fit p-0 border border-neutral-100 bg-white shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        <Calendar
          mode="range"
          defaultMonth={dateValue?.from}
          selected={dateValue}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
        />
      </CardContent>
    </Card>
  )
}
