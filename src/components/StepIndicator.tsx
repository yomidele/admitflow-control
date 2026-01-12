import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => (
        <div key={step.label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                index < currentStep
                  ? 'border-success bg-success text-success-foreground'
                  : index === currentStep
                  ? 'border-accent bg-accent text-accent-foreground shadow-gold'
                  : 'border-border bg-muted text-muted-foreground'
              )}
            >
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            <div className="mt-2 text-center">
              <p className={cn(
                'text-sm font-medium',
                index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'mx-4 h-0.5 flex-1 transition-colors duration-300',
                index < currentStep ? 'bg-success' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
