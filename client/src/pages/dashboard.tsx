import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GroupCard } from "@/components/GroupCard";
import { RecentEntries } from "@/components/dashboard/RecentEntries";
import { CategoryStats } from "@/components/dashboard/CategoryStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Event Dashboard</h1>
      </div>

      {/* Recent Entries Panel */}
      <RecentEntries attendees={attendees} />

      {/* Statistics Panel */}
      <CategoryStats attendees={attendees} />

      {/* Group Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Group Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">
              Generate groups based on matching interests and preferences
            </p>
            <Button 
              onClick={handleGenerateGroups}
              disabled={createGroupsMutation.isPending || attendees.length === 0}
            >
              Generate Groups
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Groups */}
      {groups.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Current Groups</h2>
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
        </>
      )}
    </div>
  );
}