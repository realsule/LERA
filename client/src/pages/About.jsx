import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react';
import { categoriesAPI, eventsAPI } from '../services/api';
import { getItems, getPagination } from '../utils/format';

const FEATURES = [
  {
    icon: Compass,
    title: 'Real event discovery',
    description: 'Search and filter the live catalogue by keyword, category, price, date and availability.',
  },
  {
    icon: CalendarDays,
    title: 'Live availability',
    description: 'Seat counts come from the API and change as bookings are created or cancelled.',
  },
  {
    icon: Wallet,
    title: 'Transparent pricing',
    description: 'Prices are shown in KES and booking totals are calculated by the server from the event record.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    description: 'Attendees, organizers and admins see different tools, enforced by the Flask API.',
  },
];

const About = () => {
  const [counts, setCounts] = useState({ events: null, categories: null });

  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      eventsAPI.getAll({ page: 1, per_page: 1, upcoming: 'true' }, { signal: controller.signal }),
      categoriesAPI.getAll({ signal: controller.signal }),
    ]).then(([eventsResult, categoriesResult]) => {
      if (controller.signal.aborted) return;
      setCounts({
        events:
          eventsResult.status === 'fulfilled'
            ? getPagination(eventsResult.value).total ?? getItems(eventsResult.value).length
            : null,
        categories:
          categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value)
            ? categoriesResult.value.length
            : null,
      });
    });
    return () => controller.abort();
  }, []);

  return (
    <div className="bg-slate-50">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              About LERA
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              A focused marketplace for real events.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              LERA connects organizers who publish events with attendees looking for something
              worth showing up for. The platform keeps discovery, seat availability and bookings
              in one place, backed by a Flask API.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/events" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-indigo-50">
                <Ticket className="h-4 w-4" aria-hidden="true" />
                Browse events
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 font-semibold text-white hover:bg-white/10">
                Create an account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          <div>
            <p className="text-3xl font-bold text-indigo-600">{counts.events ?? '—'}</p>
            <p className="mt-1 text-sm text-slate-600">Upcoming events listed</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-600">{counts.categories ?? '—'}</p>
            <p className="mt-1 text-sm text-slate-600">Event categories</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-600">KES</p>
            <p className="mt-1 text-sm text-slate-600">Prices shown in Kenyan shillings</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-600">3</p>
            <p className="mt-1 text-sm text-slate-600">Account roles: attendee, organizer, admin</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">What the platform does</h2>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
                  <Icon className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-7">
              <div className="flex items-center gap-2 text-indigo-700">
                <Users className="h-5 w-5" aria-hidden="true" />
                <h2 className="text-xl font-semibold">For attendees</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {[
                  'Search the live event catalogue and filter by what matters to you.',
                  'Set interests, a budget and a location to get data-driven recommendations.',
                  'Reserve real seats, then confirm or cancel from your bookings page.',
                  'Leave a review after an event.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 p-7">
              <div className="flex items-center gap-2 text-indigo-700">
                <Ticket className="h-5 w-5" aria-hidden="true" />
                <h2 className="text-xl font-semibold">For organizers</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {[
                  'Publish events with a real date, venue, capacity, price and optional cover image.',
                  'Track tickets sold and booking value from the organizer dashboard.',
                  'Edit events without reducing capacity below seats already reserved.',
                  'Delete events only when you really mean it — related bookings and reviews are removed too.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
