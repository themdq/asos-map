import { memo } from 'react';

export type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'windy';

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
}

const ICONS: Record<WeatherCondition, JSX.Element> = {
  sunny: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  'partly-cloudy': (
    <>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 2v1M8 13v1M3 8H2M14 8h-1M4.5 4.5l.7.7M11.5 11.5l-.7-.7M4.5 11.5l.7-.7M11.5 4.5l-.7.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M18 17a4 4 0 00-8 0 3 3 0 00.1 6H18a3 3 0 000-6z" />
    </>
  ),
  cloudy: (
    <>
      <path d="M19 17a4 4 0 00-8 0 3.5 3.5 0 00.2 7H19a3.5 3.5 0 000-7z" />
      <path d="M13 12a3 3 0 00-6 0 2.5 2.5 0 000 5h3" opacity="0.5" />
    </>
  ),
  rain: (
    <>
      <path d="M18 13a4 4 0 00-8 0 3 3 0 00.1 6H18a3 3 0 000-6z" />
      <path d="M8 19v3M12 19v3M16 19v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  snow: (
    <>
      <path d="M18 10a4 4 0 00-8 0 3 3 0 00.1 6H18a3 3 0 000-6z" />
      <circle cx="8" cy="20" r="1" />
      <circle cx="12" cy="22" r="1" />
      <circle cx="16" cy="20" r="1" />
      <circle cx="10" cy="18" r="1" />
      <circle cx="14" cy="18" r="1" />
    </>
  ),
  fog: (
    <path d="M4 10h16M4 14h16M6 18h12M8 6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  ),
  windy: (
    <path d="M9.59 4.59A2 2 0 1111 8H2M12.59 19.41A2 2 0 1014 16H2M17.73 7.73A2.5 2.5 0 1119.5 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  ),
};

function WeatherIconComponent({ condition, className = 'w-8 h-8 text-secondary-foreground' }: WeatherIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      {ICONS[condition]}
    </svg>
  );
}

export const WeatherIcon = memo(WeatherIconComponent);
