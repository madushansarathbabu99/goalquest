import { useState, useEffect } from 'react'
import { differenceInSeconds, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns'

export function useCountdown(deadline) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(deadline))

  function getTimeLeft(deadline) {
    const target = new Date(deadline)
    const now = new Date()
    const totalSeconds = differenceInSeconds(target, now)
    if (totalSeconds <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalSeconds: 0 }
    const days = differenceInDays(target, now)
    const hours = differenceInHours(target, now) % 24
    const minutes = differenceInMinutes(target, now) % 60
    const seconds = totalSeconds % 60
    return { days, hours, minutes, seconds, expired: false, totalSeconds }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(deadline))
    }, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  return timeLeft
}
