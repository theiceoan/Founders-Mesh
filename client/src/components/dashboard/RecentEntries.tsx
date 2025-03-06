import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Attendee } from "@shared/schema";

interface RecentEntriesProps {
  attendees: Attendee[];
}

export function RecentEntries({ attendees }: RecentEntriesProps) {
  // Get the last 10 entries, assuming the latest entries are at the end
  const recentAttendees = [...attendees].reverse().slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {recentAttendees.map((attendee) => (
            <div
              key={attendee.id}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div>
                <p className="font-medium">{attendee.name}</p>
                <p className="text-sm text-muted-foreground">{attendee.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge>{attendee.userType}</Badge>
                <Badge variant="outline">{attendee.responses.industry}</Badge>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
