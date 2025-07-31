import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
  text: string | null;
  maxLines?: number;
  className?: string;
}

export function TruncatedText({ text, maxLines = 2, className }: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.trim() === "") {
    return <span className={cn("text-muted-foreground", className)}>No description</span>;
  }

  const lines = text.split('\n');
  const shouldTruncate = lines.length > maxLines || text.length > 100;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  return (
    <div className={className}>
      <p className={cn(
        "transition-all duration-200",
        !isExpanded && "line-clamp-2"
      )}>
        {text}
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-auto p-0 text-xs text-primary hover:text-primary/80 mt-1"
      >
        {isExpanded ? "Read less" : "Read more"}
      </Button>
    </div>
  );
}