
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HRCheckInTableStatesProps {
  loading: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
}

export function HRCheckInTableStates({ loading, isEmpty, children }: HRCheckInTableStatesProps) {
  if (loading) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Recent Check-Ins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Loading check-ins...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Recent Check-Ins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No check-ins recorded yet. Create your first check-in to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>Recent Check-Ins</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
