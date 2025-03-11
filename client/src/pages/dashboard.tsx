import { useQuery } from "@tanstack/react-query";
import { RecentEntries } from "@/components/dashboard/RecentEntries";
import { CategoryStats } from "@/components/dashboard/CategoryStats";
import type { Attendee } from "@shared/schema";

export default function Dashboard() {
  const { data: attendees = [] } = useQuery<Attendee[]>({
    queryKey: ["/api/attendees"]
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Event Dashboard</h1>
      </div>

      {/* Recent Entries Panel */}
      <RecentEntries attendees={attendees} />

      {/* Statistics Panel */}
      <CategoryStats attendees={attendees} />
    </div>
  );
}