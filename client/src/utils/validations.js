import * as yup from 'yup';

// Common validation patterns
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phonePattern = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

// Base validation schemas
export const baseSchemas = {
  email: yup
    .string()
    .email('Please enter a valid email address')
    .matches(emailPattern, 'Please enter a valid email address')
    .required('Email is required'),
  
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(
      passwordPattern,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters')
    .required('Name is required'),
  
  phone: yup
    .string()
    .matches(phonePattern, 'Please enter a valid phone number')
    .optional(),
};

// Authentication validation schemas
export const authSchemas = {
  login: yup.object().shape({
    email: baseSchemas.email,
    password: yup.string().required('Password is required'),
  }),
  
  register: yup.object().shape({
    firstName: baseSchemas.name,
    lastName: baseSchemas.name,
    email: baseSchemas.email,
    password: baseSchemas.password,
    confirmPassword: baseSchemas.confirmPassword,
    phone: baseSchemas.phone,
    role: yup
      .string()
      .oneOf(['attendee', 'organizer', 'admin'], 'Invalid role selected')
      .default('attendee'),
  }),
  
  forgotPassword: yup.object().shape({
    email: baseSchemas.email,
  }),
  
  resetPassword: yup.object().shape({
    token: yup.string().required('Reset token is required'),
    password: baseSchemas.password,
    confirmPassword: baseSchemas.confirmPassword,
  }),
  
  changePassword: yup.object().shape({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: baseSchemas.password,
    confirmNewPassword: yup
      .string()
      .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
      .required('Please confirm your new password'),
  }),
};

// Event validation schemas
export const eventSchemas = {
  create: yup.object().shape({
    title: yup
      .string()
      .min(3, 'Event title must be at least 3 characters long')
      .max(100, 'Event title cannot exceed 100 characters')
      .required('Event title is required'),
    
    description: yup
      .string()
      .min(10, 'Description must be at least 10 characters long')
      .max(2000, 'Description cannot exceed 2000 characters')
      .required('Description is required'),
    
    category: yup
      .string()
      .oneOf(['concert', 'conference', 'sports', 'workshop', 'party', 'other'], 'Invalid category')
      .required('Category is required'),
    
    date: yup
      .date()
      .min(new Date(), 'Event date cannot be in the past')
      .required('Event date is required'),
    
    time: yup
      .string()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)')
      .required('Event time is required'),
    
    venue: yup.object().shape({
      name: yup.string().required('Venue name is required'),
      address: yup.string().required('Venue address is required'),
      capacity: yup
        .number()
        .min(1, 'Capacity must be at least 1')
        .required('Venue capacity is required'),
    }),
    
    ticketTypes: yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required('Ticket type name is required'),
          price: yup
            .number()
            .min(0, 'Price cannot be negative')
            .required('Ticket price is required'),
          quantity: yup
            .number()
            .min(1, 'Quantity must be at least 1')
            .required('Ticket quantity is required'),
        })
      )
      .min(1, 'At least one ticket type is required')
      .required('Ticket types are required'),
    
    image: yup
      .mixed()
      .test('fileType', 'Only JPEG, PNG, and WebP images are allowed', (value) => {
        if (!value) return true; // Optional field
        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        return supportedTypes.includes(value.type);
      })
      .test('fileSize', 'Image size must be less than 5MB', (value) => {
        if (!value) return true; // Optional field
        return value.size <= 5 * 1024 * 1024;
      })
      .optional(),
  }),
  
  update: yup.object().shape({
    title: yup.string().min(3).max(100).optional(),
    description: yup.string().min(10).max(2000).optional(),
    category: yup.string().oneOf(['concert', 'conference', 'sports', 'workshop', 'party', 'other']).optional(),
    date: yup.date().min(new Date()).optional(),
    time: yup.string().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    venue: yup.object().shape({
      name: yup.string().optional(),
      address: yup.string().optional(),
      capacity: yup.number().min(1).optional(),
    }).optional(),
  }),
};

// User profile validation schemas
export const userSchemas = {
  updateProfile: yup.object().shape({
    firstName: baseSchemas.name.optional(),
    lastName: baseSchemas.name.optional(),
    phone: baseSchemas.phone.optional(),
    bio: yup
      .string()
      .max(500, 'Bio cannot exceed 500 characters')
      .optional(),
    avatar: yup
      .mixed()
      .test('fileType', 'Only JPEG, PNG, and WebP images are allowed', (value) => {
        if (!value) return true;
        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        return supportedTypes.includes(value.type);
      })
      .test('fileSize', 'Image size must be less than 2MB', (value) => {
        if (!value) return true;
        return value.size <= 2 * 1024 * 1024;
      })
      .optional(),
  }),
};

// Ticket validation schemas
export const ticketSchemas = {
  purchase: yup.object().shape({
    eventId: yup.string().required('Event ID is required'),
    ticketTypeId: yup.string().required('Ticket type is required'),
    quantity: yup
      .number()
      .min(1, 'Quantity must be at least 1')
      .max(10, 'Maximum 10 tickets can be purchased at once')
      .required('Quantity is required'),
    
    attendeeInfo: yup
      .array()
      .of(
        yup.object().shape({
          firstName: baseSchemas.name,
          lastName: baseSchemas.name,
          email: baseSchemas.email,
          phone: baseSchemas.phone.optional(),
        })
      )
      .min(1, 'At least one attendee information is required')
      .required('Attendee information is required'),
    
    paymentMethod: yup
      .string()
      .oneOf(['credit_card', 'debit_card', 'paypal', 'mpesa'], 'Invalid payment method')
      .required('Payment method is required'),
  }),
};

// Form validation helpers
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (errors) {
    const formattedErrors = {};
    errors.inner.forEach((error) => {
      formattedErrors[error.path] = error.message;
    });
    return { isValid: false, errors: formattedErrors };
  }
};

// Real-time validation helper
export const validateField = async (schema, field, value) => {
  try {
    await schema.validateAt(field, { [field]: value });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

export default {
  baseSchemas,
  authSchemas,
  eventSchemas,
  userSchemas,
  ticketSchemas,
  validateForm,
  validateField,
};