import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Save,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react';
import EventImage from '../components/events/EventImage';
import { categoriesAPI, eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { normalizeEvent, toDateTimeLocal } from '../utils/format';

const EMPTY_FORM = {
  title: '',
  description: '',
  date: '',
  location: '',
  price: '0',
  capacity: '',
  category_id: '',
  image_url: '',
};

function localDateTimeMin() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

const EventForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(EMPTY_FORM);
  const [existing, setExisting] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    categoriesAPI
      .getAll({ signal: controller.signal })
      .then((result) => setCategories(Array.isArray(result) ? result : []))
      .catch(() => setCategories([]));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isEdit) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    eventsAPI
      .getById(id, { signal: controller.signal })
      .then((result) => {
        const event = normalizeEvent(result);
        if (!event) throw new Error('The event could not be read.');
        setExisting(event);
        setForm({
          title: event.title || '',
          description: event.description || '',
          date: toDateTimeLocal(event.date),
          location: event.location || '',
          price: String(event.price ?? 0),
          capacity: String(event.capacity ?? ''),
          category_id: event.categoryId ? String(event.categoryId) : '',
          image_url: event.imageUrl || '',
        });
      })
      .catch((err) => {
        if (!err?.isCanceled) {
          setLoadError(err?.message || 'The event could not be loaded.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, isEdit]);

  const canManage =
    existing && user && (user.role === 'admin' || Number(user.id) === Number(existing.organizerId));

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError(null);
  };

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required.';
    else if (form.title.trim().length > 200) errors.title = 'Title cannot exceed 200 characters.';
    if (!form.date) errors.date = 'Date and time are required.';
    if (!form.location.trim()) errors.location = 'Location is required.';
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) errors.price = 'Price must be zero or more.';
    const capacity = Number(form.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) errors.capacity = 'Capacity must be at least 1.';
    if (existing && capacity < existing.reservedSeats) {
      errors.capacity = `Capacity cannot be below the ${existing.reservedSeats} seats already reserved.`;
    }
    if (form.description.length > 10000) errors.description = 'Description is too long.';
    if (form.image_url && form.image_url.length > 500) errors.image_url = 'Image URL cannot exceed 500 characters.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    if (saving || !validate()) return;
    setSaving(true);
    setError(null);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      location: form.location.trim(),
      price: Number(form.price),
      capacity: Number(form.capacity),
      category_id: form.category_id ? Number(form.category_id) : null,
      image_url: form.image_url.trim(),
    };

    try {
      const result = isEdit
        ? await eventsAPI.update(id, payload)
        : await eventsAPI.create(payload);
      const created = normalizeEvent(result);
      navigate(`/events/${created?.id ?? id}`, { replace: true });
    } catch (err) {
      if (err?.details && typeof err.details === 'object') {
        setFieldErrors(err.details);
      }
      setError(err?.message || 'The event could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && loading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 px-4 py-20 text-slate-600" role="status">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
        Loading event…
      </div>
    );
  }

  if (isEdit && (loadError || !existing)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Event could not be loaded</h1>
        <p className="mt-2 text-slate-600">{loadError || 'The event was not found.'}</p>
        <Link to="/dashboard" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (isEdit && existing && !canManage) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">You cannot edit this event</h1>
        <p className="mt-2 text-slate-600">Only the organizer who created it, or an administrator, can make changes.</p>
        <Link to={`/events/${existing.id}`} className="mt-6 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          View event
        </Link>
      </div>
    );
  }

  const inputClass = (field) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
      fieldErrors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
    }`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          {isEdit ? 'Edit event' : 'New event'}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {isEdit ? `Edit ${existing?.title}` : 'Publish an event'}
        </h1>
        <p className="mt-2 text-slate-600">
          These fields are stored by the Flask API. Capacity and price become authoritative
          for every booking.
        </p>
      </div>

      {isEdit && existing && (
        <p className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
          {existing.reservedSeats.toLocaleString()} seat{existing.reservedSeats === 1 ? '' : 's'} are already reserved.
          Capacity cannot be reduced below that number.
        </p>
      )}

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
            Event title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            maxLength={200}
            required
            placeholder="e.g. Nairobi Jazz Evening"
            className={inputClass('title')}
            aria-invalid={Boolean(fieldErrors.title)}
          />
          {fieldErrors.title && <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            rows={6}
            maxLength={10000}
            placeholder="What should attendees expect?"
            className={inputClass('description')}
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>{fieldErrors.description || 'Plain text is supported.'}</span>
            <span>{form.description.length.toLocaleString()} / 10,000</span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Date and time <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              type="datetime-local"
              value={form.date}
              min={isEdit ? undefined : localDateTimeMin()}
              onChange={(event) => updateField('date', event.target.value)}
              required
              className={inputClass('date')}
            />
            {fieldErrors.date && <p className="mt-1 text-sm text-red-600">{fieldErrors.date}</p>}
          </div>

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="category"
              value={form.category_id}
              onChange={(event) => updateField('category_id', event.target.value)}
              className={inputClass('category_id')}
            >
              <option value="">Uncategorised</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {fieldErrors.category_id && <p className="mt-1 text-sm text-red-600">{fieldErrors.category_id}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="location" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              type="text"
              value={form.location}
              onChange={(event) => updateField('location', event.target.value)}
              maxLength={200}
              required
              placeholder="Venue name, city"
              className={inputClass('location')}
            />
            {fieldErrors.location && <p className="mt-1 text-sm text-red-600">{fieldErrors.location}</p>}
          </div>

          <div>
            <label htmlFor="price" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Wallet className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Price per ticket (KES) <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateField('price', event.target.value)}
              required
              className={inputClass('price')}
            />
            {fieldErrors.price && <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>}
            <p className="mt-1 text-xs text-slate-500">Set 0 for a free event.</p>
          </div>

          <div>
            <label htmlFor="capacity" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Capacity <span className="text-red-500">*</span>
            </label>
            <input
              id="capacity"
              type="number"
              min="1"
              step="1"
              value={form.capacity}
              onChange={(event) => updateField('capacity', event.target.value)}
              required
              className={inputClass('capacity')}
            />
            {fieldErrors.capacity && <p className="mt-1 text-sm text-red-600">{fieldErrors.capacity}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="image_url" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <ImageIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Cover image URL (optional)
            </label>
            <input
              id="image_url"
              type="url"
              value={form.image_url}
              onChange={(event) => updateField('image_url', event.target.value)}
              maxLength={500}
              placeholder="https://…"
              className={inputClass('image_url')}
            />
            {fieldErrors.image_url && <p className="mt-1 text-sm text-red-600">{fieldErrors.image_url}</p>}
            {form.image_url && (
              <div className="mt-3 h-36 w-full overflow-hidden rounded-xl border border-slate-200 sm:w-72">
                <EventImage
                  src={form.image_url}
                  alt="Cover preview"
                  category={form.category_id
                    ? categories.find((category) => String(category.id) === form.category_id)?.name
                    : 'other'}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Link
            to={isEdit ? `/events/${id}` : '/dashboard'}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : isEdit ? (
              <Save className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Ticket className="h-4 w-4" aria-hidden="true" />
            )}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
