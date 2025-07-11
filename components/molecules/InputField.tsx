'use client'

import { forwardRef } from 'react'
import { Input, InputProps, Text } from '../atoms'
import { cn } from '../../utils/cn'

export interface InputFieldProps extends Omit<InputProps, 'error'> {
  label?: string
  error?: string
  hint?: string
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error: errorMessage, hint, className, id, ...props }, ref) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className={cn('space-y-1', className)}>
        {label && (
          <label htmlFor={fieldId}>
            <Text
              as="span"
              variant="label"
              weight="medium"
              size="sm"
            >
              {label}
            </Text>
          </label>
        )}
        
        <Input
          ref={ref}
          id={fieldId}
          error={!!errorMessage}
          {...props}
        />
        
        {(errorMessage || hint) && (
          <Text
            variant={errorMessage ? 'error' : 'caption'}
            size="xs"
          >
            {errorMessage || hint}
          </Text>
        )}
      </div>
    )
  }
)

InputField.displayName = 'InputField'