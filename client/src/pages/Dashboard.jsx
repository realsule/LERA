import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminPanel from '../components/Dashboard/AdminPanel';
import OrganizerPanel from '../components/Dashboard/OrganizerPanel';
import AttendeePanel from '../components/Dashboard/AttendeePanel';
import { CalendarDays, ShieldCheck, UserRound } from 'lucide-react';

const Dashboard = ({ adminView = false }) => {
  const { user, hasRole } = useAuth();

  const role = adminView ? 'admin' : user?.role || 'attendee';
  const roleInfo =
    role === 'admin'
      ? {
          title: 'Admin dashboard',
          description: 'Platform-wide users, events and booking activity',
          icon: ShieldCheck,
          color: 'text-purple-700',
          bgColor: 'bg-purple-100',
        }
      : role === 'organizer'
        ? {
            title: 'Organizer dashboard',
            description: 'Publish events and follow real booking activity',
            icon: CalendarDays,
            color: 'text-indigo-700',
            bgColor: 'bg-indigo-100',
          }
        : {
            title: 'Attendee dashboard',
            description: 'Your tickets, upcoming events and personalised picks',
            icon: UserRound,
            color: 'text-emerald-700',
            bgColor: 'bg-emerald-100',
          };

  const Icon = roleInfo.icon;
  const initials = (user?.username || user?.email || 'L').slice(0, 2).toUpperCase();

  const panel = adminView || hasRole('admin')
    ? <AdminPanel />
    : hasRole('organizer')
      ? <OrganizerPanel />
      : <AttendeePanel />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={`rounded-2xl p-3 ${roleInfo.bgColor}`}>
                <Icon className={`h-7 w-7 ${roleInfo.color}`} aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{roleInfo.title}</h1>
                <p className="text-slate-600">{roleInfo.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Signed in as</p>
                <p className="font-semibold text-slate-900">{user?.username}</p>
                <p className="text-xs capitalize text-slate-500">{user?.role}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {initials}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{panel}</div>
    </div>
  );
};

export default Dashboard;
