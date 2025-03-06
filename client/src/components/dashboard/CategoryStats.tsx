import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Attendee } from "@shared/schema";

interface CategoryStatsProps {
  attendees: Attendee[];
}

export function CategoryStats({ attendees }: CategoryStatsProps) {
  // Calculate statistics
  const userTypeStats = attendees.reduce((acc, attendee) => {
    acc[attendee.userType] = (acc[attendee.userType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const industryStats = attendees.reduce((acc, attendee) => {
    acc[attendee.responses.industry] = (acc[attendee.responses.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userTypeData = Object.entries(userTypeStats).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value
  }));

  const industryData = Object.entries(industryStats).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Attendee Types</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userTypeData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Industry Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
