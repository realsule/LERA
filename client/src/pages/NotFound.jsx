import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFound = () => (
  <div className="flex min-h-[70vh] items-center justify-center px-4">
    <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
        <Compass className="h-7 w-7 text-indigo-700" aria-hidden="true" />
      </div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">
        The page you asked for does not exist. The event may have been removed, or the link
        may be out of date.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          to="/events"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Compass className="h-4 w-4" aria-hidden="true" />
          Browse events
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Home
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
