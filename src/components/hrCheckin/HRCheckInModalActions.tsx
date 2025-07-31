
import { Button } from "@/components/ui/button";

interface HRCheckInModalActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
}

export function HRCheckInModalActions({
  onCancel,
  onSubmit,
  isSubmitting,
  canSubmit
}: HRCheckInModalActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting || !canSubmit}
      >
        {isSubmitting ? "Saving..." : "Save Department Check-In"}
      </Button>
    </div>
  );
}
