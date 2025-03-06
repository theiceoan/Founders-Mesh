import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GroupCard } from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import { suggestGroups } from "@/lib/grouping";
import type { Attendee, Group } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: attendees = [] } = useQuery<Attendee[]>({
    queryKey: ["/api/attendees"]
  });

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ["/api/groups"]
  });

  const createGroupsMutation = useMutation({
    mutationFn: async (suggestedGroups: Group[]) => {
      for (const group of suggestedGroups) {
        await apiRequest("POST", "/api/groups", group);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Groups created",
        description: "Successfully generated group suggestions"
      });
    }
  });

  const handleGenerateGroups = () => {
    const suggestedGroups = suggestGroups(attendees);
    createGroupsMutation.mutate(suggestedGroups);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Event Dashboard</h1>
        <Button 
          onClick={handleGenerateGroups}
          disabled={createGroupsMutation.isPending}
        >
          Generate Groups
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            attendees={attendees}
            onLock={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
            }}
          />
        ))}
      </div>
    </div>
  );
}
