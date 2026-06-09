import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  className,
  disabled,
  ...props
}) => {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
            checked
              ? 'bg-clay-600 border-clay-600'
              : 'bg-white border-clay-300 hover:border-clay-400'
          )}
        >
          {checked && (
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          )}
        </div>
      </div>
      {label && (
        <span className="text-clay-700 text-sm font-medium">{label}</span>
      )}
    </label>
  );
};
