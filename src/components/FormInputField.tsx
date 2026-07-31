import { FormControl, FormItem, FormLabel, FormMessage } from '#/components/ui/form.tsx'
import { Input } from '#/components/ui/input.tsx'
import { cn } from '#/lib/utils.ts'

interface FormInputFieldProps extends React.ComponentProps<'input'> {
  label?: string
  classNames?: {
    root?: string
    label?: string
    input?: string
  }
}

export function FormInputField({
  label,
  classNames,
  className,
  required,
  ...props
}: FormInputFieldProps) {
  return (
    <FormItem className={classNames?.root}>
      {label && (
        <FormLabel className={cn('text-xs font-semibold text-muted-foreground', classNames?.label)}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </FormLabel>
      )}
      <FormControl>
        <Input
          className={cn('h-12 rounded-2xl border-none bg-muted px-4', classNames?.input, className)}
          required={required}
          {...props}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}
