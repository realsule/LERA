import React, { forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  className = '',
  icon: Icon,
  showPasswordToggle = false,
  onPasswordToggle,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const handlePasswordToggle = () => {
    if (onPasswordToggle) {
      onPasswordToggle(!showPassword);
    } else {
      setShowPassword(!showPassword);
    }
  };

  const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
  const stateClasses = error
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : success
    ? 'border-green-300 text-green-900 placeholder-green-300 focus:ring-green-500 focus:border-green-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500';
  
  const sizeClasses = 'px-3 py-2 text-sm';
  const disabledClasses = disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed';
  const iconClasses = Icon ? 'pl-10' : '';
  const passwordToggleClasses = isPassword && showPasswordToggle ? 'pr-10' : '';

  const classes = [
    baseClasses,
    stateClasses,
    sizeClasses,
    disabledClasses,
    iconClasses,
    passwordToggleClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={classes}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
        
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={handlePasswordToggle}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
        
        {success && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>
      
      {(helperText || error) && (
        <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
