import type { Attendee, Group, eventFormats } from "@shared/schema";

export function suggestGroups(attendees: Attendee[]): Group[] {
  const groups: Group[] = [];

  // Group by format preference first
  const byFormat = attendees.reduce((acc, attendee) => {
    const format = attendee.responses.preferredFormat as typeof eventFormats[number];
    if (!acc[format]) acc[format] = [];
    acc[format].push(attendee);
    return acc;
  }, {} as Record<string, Attendee[]>);

  // For each format, create industry-based groups of 5-10 people
  Object.entries(byFormat).forEach(([format, formatAttendees]) => {
    const byIndustry = formatAttendees.reduce((acc, attendee) => {
      const industry = attendee.responses.industry;
      if (!acc[industry]) acc[industry] = [];
      acc[industry].push(attendee);
      return acc;
    }, {} as Record<string, Attendee[]>);

    Object.entries(byIndustry).forEach(([industry, industryAttendees]) => {
      // Split into groups of 5-10
      for (let i = 0; i < industryAttendees.length; i += 8) {
        const groupName = `${industry.charAt(0).toUpperCase() + industry.slice(1)} ${format}`;
        groups.push({
          id: groups.length + 1,
          name: groupName,
          format: format as typeof eventFormats[number],
          locked: "false"
        });
      }
    });
  });

  return groups;
}