
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Zap, AlertCircle } from "lucide-react";

interface AutoGenerationStatusProps {
  onTasksGenerated: () => void;
}

export function AutoGenerationStatus({ onTasksGenerated }: AutoGenerationStatusProps) {
  const [loading, setLoading] = useState(false);
  const [lastGeneration, setLastGeneration] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkLastGeneration();
  }, []);

  const checkLastGeneration = async () => {
    try {
      // Get the most recent task creation date this month
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

      onTasksGenerated();
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

  const getNextGenerationDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const hasGeneratedThisMonth = () => {
    if (!lastGeneration) return false;
    const now = new Date();
    return lastGeneration.getMonth() === now.getMonth() && 
           lastGeneration.getFullYear() === now.getFullYear();
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Automatic Task Generation
          </CardTitle>
          <Badge variant={hasGeneratedThisMonth() ? "default" : "secondary"}>
            {hasGeneratedThisMonth() ? "Generated" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Next Auto-Generation:</span>
            </div>
            <p className="font-medium">{getNextGenerationDate()}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last Generated:</span>
            </div>
            <p className="font-medium">
              {lastGeneration 
                ? lastGeneration.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : "Never"
              }
            </p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Tasks are automatically generated on the 1st of each month for all active BAU templates.
            </div>
            <Button 
              onClick={handleManualGenerate} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? "Generating..." : "Generate Now"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
