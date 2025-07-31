
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HRCheckin } from "@/types/hrCheckin";
import { HRCheckInTableRow } from "./HRCheckInTableRow";

interface HRCheckInTableContentProps {
  checkins: HRCheckin[];
  taskCounts: Record<string, number>;
  onViewCheckin: (checkin: HRCheckin) => void;
  onDeleteCheckin?: (checkin: HRCheckin) => void;
}

export function HRCheckInTableContent({ 
  checkins, 
  taskCounts,
  onViewCheckin, 
  onDeleteCheckin 
}: HRCheckInTableContentProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Checked In By</TableHead>
          <TableHead>Follow-up Tasks</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {checkins.map((checkin) => (
          <HRCheckInTableRow
            key={checkin.id}
            checkin={checkin}
            taskCount={taskCounts[checkin.id] || 0}
            onView={onViewCheckin}
            onDelete={onDeleteCheckin}
          />
        ))}
      </TableBody>
    </Table>
  );
}
