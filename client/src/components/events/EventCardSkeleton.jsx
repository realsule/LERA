import React from 'react';

const EventCardSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-44 animate-pulse bg-slate-200" />
        <div className="space-y-3 p-5">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="flex gap-3 pt-2">
            <div className="h-9 flex-1 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default EventCardSkeleton;
