import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Ticket } from 'lucide-react';
import { checkHealth } from '../../services/api';

const Footer = () => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let active = true;
    const runCheck = async () => {
      const result = await checkHealth();
      if (active) setStatus(result.status === 'healthy' ? 'online' : 'offline');
    };

    runCheck();
    const interval = setInterval(runCheck, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const statusStyles =
    status === 'online'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'offline'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
                <Ticket className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900">LERA</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
              An event marketplace for discovering real events, seeing live seat availability
              and booking tickets in Kenyan shillings.
            </p>
            <div className="mt-5">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyles}`}>
                <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                {status === 'online' ? 'API online' : status === 'offline' ? 'API offline' : 'Checking API…'}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">Explore</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/events" className="text-slate-600 hover:text-indigo-700">Browse events</Link></li>
              <li><Link to="/events?sort=popular" className="text-slate-600 hover:text-indigo-700">Popular events</Link></li>
              <li><Link to="/events?available=true" className="text-slate-600 hover:text-indigo-700">Seats available</Link></li>
              <li><Link to="/about" className="text-slate-600 hover:text-indigo-700">About LERA</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">Your account</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/dashboard" className="text-slate-600 hover:text-indigo-700">Dashboard</Link></li>
              <li><Link to="/bookings" className="text-slate-600 hover:text-indigo-700">My bookings</Link></li>
              <li><Link to="/events/create" className="text-slate-600 hover:text-indigo-700">Create an event</Link></li>
              <li><Link to="/login" className="text-slate-600 hover:text-indigo-700">Sign in</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-500">
          © {new Date().getFullYear()} LERA. Event data is served by the configured LERA API.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
