import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Users } from "lucide-react";
import type { Attendee, Group } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GroupCardProps {
  group: Group;
  attendees: Attendee[];
  onLock: () => void;
}

export function GroupCard({ group, attendees, onLock }: GroupCardProps) {
  const [isLocking, setIsLocking] = useState(false);
  const { toast } = useToast();

  const groupAttendees = attendees.filter(a => a.groupId === group.id);

  const handleLock = async () => {
    try {
      setIsLocking(true);
      await apiRequest("POST", `/api/groups/${group.id}/lock`);
      onLock();
      toast({
        title: "Group locked",
        description: "The group has been finalized"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to lock group",
        variant: "destructive"
      });
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{group.name}</CardTitle>
        <Badge variant={group.locked ? "secondary" : "outline"}>
          {group.format}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Users className="h-4 w-4" />
          <span>{groupAttendees.length} attendees</span>
        </div>
        
        <div className="space-y-2">
          {groupAttendees.map(attendee => (
            <div key={attendee.id} className="flex items-center justify-between py-1">
              <span>{attendee.name}</span>
              <Badge variant="outline">{attendee.userType}</Badge>
            </div>
          ))}
        </div>

        {!group.locked && (
          <Button 
            className="w-full mt-4"
            onClick={handleLock}
            disabled={isLocking}
          >
            <Lock className="w-4 h-4 mr-2" />
            Lock Group
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
