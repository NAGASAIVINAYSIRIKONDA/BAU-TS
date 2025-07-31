
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";

interface HRCheckInTableActionsProps {
  onView: () => void;
  onDelete?: () => void;
}

export function HRCheckInTableActions({ onView, onDelete }: HRCheckInTableActionsProps) {
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onView}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
