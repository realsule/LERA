import React, { useState } from 'react';
import {
  Briefcase,
  CalendarDays,
  Clapperboard,
  Cpu,
  Mic2,
  Music,
  Palette,
  PartyPopper,
  Trophy,
  Wrench,
} from 'lucide-react';
import { categoryLabel } from '../../utils/format';

/**
 * A real cover image when the organizer supplied one, otherwise a
 * category-based placeholder. The placeholder is deterministic, so it never
 * implies that an unreported photo, venue or price exists.
 */
const THEMES = {
  music: {
    gradient: 'from-fuchsia-600 via-purple-600 to-indigo-700',
    Icon: Music,
  },
  concert: {
    gradient: 'from-rose-500 via-pink-600 to-purple-700',
    Icon: Mic2,
  },
  conference: {
    gradient: 'from-sky-600 via-blue-600 to-indigo-700',
    Icon: Briefcase,
  },
  technology: {
    gradient: 'from-cyan-600 via-sky-600 to-blue-700',
    Icon: Cpu,
  },
  sports: {
    gradient: 'from-emerald-500 via-green-600 to-teal-700',
    Icon: Trophy,
  },
  workshop: {
    gradient: 'from-amber-500 via-orange-500 to-rose-600',
    Icon: Wrench,
  },
  party: {
    gradient: 'from-pink-500 via-rose-500 to-orange-500',
    Icon: PartyPopper,
  },
  art: {
    gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
    Icon: Palette,
  },
  theater: {
    gradient: 'from-red-500 via-rose-600 to-purple-700',
    Icon: Clapperboard,
  },
  networking: {
    gradient: 'from-indigo-500 via-blue-600 to-cyan-600',
    Icon: Briefcase,
  },
  other: {
    gradient: 'from-slate-600 via-slate-700 to-slate-900',
    Icon: CalendarDays,
  },
};

function themeFor(category) {
  return THEMES[String(category || '').toLowerCase()] || THEMES.other;
}

const EventImage = ({ src, alt, category, className = '', iconClassName = 'h-14 w-14' }) => {
  // Track which src failed so changing the image automatically retries.
  const [failedSrc, setFailedSrc] = useState(null);

  const label = categoryLabel(category);
  const { gradient, Icon } = themeFor(category);

  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
        onError={() => setFailedSrc(src)}
      />
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
      role="img"
      aria-label={`${label} event placeholder image`}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" aria-hidden="true" />
      <div className="absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-black/10" aria-hidden="true" />
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute left-8 top-8 h-px w-24 bg-white" />
        <div className="absolute bottom-10 right-8 h-px w-20 bg-white" />
      </div>
      <div className="relative flex flex-col items-center gap-2 text-white">
        <Icon className={iconClassName} aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
          {label}
        </span>
      </div>
    </div>
  );
};

export default EventImage;
