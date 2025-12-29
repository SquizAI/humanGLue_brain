// Simple toast hook - using console.log as fallback
// TODO: Implement proper toast UI component

export interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const toast = ({ title, description, variant }: ToastProps) => {
    const message = description ? `${title}: ${description}` : title

    if (variant === 'destructive') {
      console.error(message)
      // In production, this would show an error toast
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`Error: ${message}`)
      }
    } else {
      console.log(message)
      // In production, this would show a success toast
    }
  }

  return { toast }
}
