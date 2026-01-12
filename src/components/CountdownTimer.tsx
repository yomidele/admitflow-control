import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  label: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  return (
    <div className="text-center">
      <p className="mb-4 text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex justify-center gap-3">
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg md:h-20 md:w-20 md:text-3xl">
                {String(unit.value).padStart(2, '0')}
              </div>
              <span className="mt-2 text-xs font-medium text-muted-foreground">{unit.label}</span>
            </div>
            {index < timeUnits.length - 1 && (
              <span className="text-2xl font-bold text-muted-foreground/50">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
