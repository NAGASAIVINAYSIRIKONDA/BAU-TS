
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Calendar, Zap } from "lucide-react";
import { format, subMonths, addMonths } from "date-fns";

interface MonthSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availableMonths?: string[];
  onTasksGenerated?: () => void;
}

export function MonthSelector({ selectedDate, onDateChange, availableMonths = [], onTasksGenerated }: MonthSelectorProps) {
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [loading, setLoading] = useState(false);
  const [lastGeneration, setLastGeneration] = useState<Date | null>(null);
  const { toast } = useToast();
  
  const months = [
    { value: 0, label: "Jan" },
    { value: 1, label: "Feb" },
    { value: 2, label: "Mar" },
    { value: 3, label: "Apr" },
    { value: 4, label: "May" },
    { value: 5, label: "Jun" },
    { value: 6, label: "Jul" },
    { value: 7, label: "Aug" },
    { value: 8, label: "Sep" },
    { value: 9, label: "Oct" },
    { value: 10, label: "Nov" },
    { value: 11, label: "Dec" }
  ];

  useEffect(() => {
    checkLastGeneration();
  }, []);

  const checkLastGeneration = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const { data, error } = await supabase
        .from('bau_task_instances')
        .select('created_at')
        .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setLastGeneration(new Date(data[0].created_at));
      }
    } catch (error) {
      console.error('Error checking last generation:', error);
    }
  };

  const handleManualGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-generate-bau-tasks');

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message || "Tasks generated successfully",
      });

      onTasksGenerated?.();
      checkLastGeneration();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    onDateChange(newDate);
  };

  const handleMonthChange = (monthValue: string) => {
    const newDate = new Date(currentYear, parseInt(monthValue), 1);
    onDateChange(newDate);
  };

  const handleYearChange = (yearValue: string) => {
    const newYear = parseInt(yearValue);
    setCurrentYear(newYear);
    const newDate = new Date(newYear, selectedDate.getMonth(), 1);
    onDateChange(newDate);
  };

  const isCurrentMonth = format(selectedDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM');
  const isFutureMonth = selectedDate > new Date();
  const hasGeneratedThisMonth = () => {
    if (!lastGeneration) return false;
    const now = new Date();
    return lastGeneration.getMonth() === now.getMonth() && 
           lastGeneration.getFullYear() === now.getFullYear();
  };

  const currentYear_actual = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear_actual - i);

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Period & Generation
          </CardTitle>
          {isCurrentMonth && (
            <Badge variant={hasGeneratedThisMonth() ? "default" : "secondary"} className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {hasGeneratedThisMonth() ? "Generated" : "Pending"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Navigation and Selectors */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
            className="flex items-center gap-1 px-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Select value={selectedDate.getMonth().toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            disabled={isFutureMonth}
            className="flex items-center gap-1 px-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isCurrentMonth ? "default" : "outline"}
            size="sm"
            onClick={() => onDateChange(new Date())}
          >
            This Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(subMonths(new Date(), 1))}
          >
            Last Month
          </Button>
        </div>

        {/* Status Info */}
        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <div>
            <span className="text-muted-foreground">Viewing: </span>
            <span className="font-medium">{format(selectedDate, 'MMMM yyyy')}</span>
            {isCurrentMonth && <span className="text-primary ml-2">(Current)</span>}
          </div>
          
          {isCurrentMonth && (
            <Button 
              onClick={handleManualGenerate} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? "Generating..." : "Generate"}
            </Button>
          )}
        </div>

        {/* Generation Info for Current Month */}
        {isCurrentMonth && lastGeneration && (
          <div className="text-xs text-muted-foreground">
            Last generated: {lastGeneration.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
