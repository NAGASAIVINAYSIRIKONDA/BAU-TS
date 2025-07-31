
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { HRCheckin } from "@/types/hrCheckin";
import { format } from "date-fns";
import { HRCheckInTableActions } from "./HRCheckInTableActions";
import { CheckCircle2 } from "lucide-react";

interface HRCheckInTableRowProps {
  checkin: HRCheckin;
  taskCount: number;
  onView: (checkin: HRCheckin) => void;
  onDelete?: (checkin: HRCheckin) => void;
}

export function HRCheckInTableRow({ checkin, taskCount, onView, onDelete }: HRCheckInTableRowProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Needs Support':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <TableRow>
      <TableCell>
        {format(new Date(checkin.checkin_date), 'MMM dd, yyyy')}
      </TableCell>
      <TableCell>
        <div className="font-medium">{checkin.department || '-'}</div>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(checkin.status)}>
          {checkin.status}
        </Badge>
      </TableCell>
      <TableCell>
        {checkin.checked_in_by_profile?.first_name} {checkin.checked_in_by_profile?.last_name}
      </TableCell>
      <TableCell>
        {taskCount > 0 ? (
          <div className="flex items-center gap-1 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">No tasks</span>
        )}
      </TableCell>
      <TableCell>
        <HRCheckInTableActions
          onView={() => onView(checkin)}
          onDelete={onDelete ? () => onDelete(checkin) : undefined}
        />
      </TableCell>
    </TableRow>
  );
}
