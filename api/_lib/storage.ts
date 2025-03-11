import { type InsertAttendee, type Attendee } from "../../shared/schema";
import { stringify } from 'csv-stringify/sync';
import nodemailer from 'nodemailer';

// Configure nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// In-memory storage for the current session
let attendees: Attendee[] = [];
let currentId = 1;

function convertToCSV(attendees: Attendee[]): string {
  console.log('Converting attendees to CSV format:', attendees.length, 'records');
  const rows = attendees.map(attendee => ({
    id: attendee.id,
    name: attendee.name,
    email: attendee.email,
    userType: attendee.userType,
    startupStage: attendee.responses.startupStage || 'N/A',
    challenge: attendee.responses.challenge || 'N/A',
    industry: attendee.responses.industry,
    preferredFormat: attendee.responses.preferredFormat
  }));

  const csvData = stringify(rows, {
    header: true,
    columns: ['id', 'name', 'email', 'userType', 'startupStage', 'challenge', 'industry', 'preferredFormat']
  });
  console.log('CSV generation successful');
  return csvData;
}

async function sendEmailWithCSV(csvData: string) {
  console.log('Preparing to send email with CSV attachment');
  const date = new Date().toISOString().split('T')[0];

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: process.env.GMAIL_EMAIL,
      subject: `Founders Mesh - Attendee Data ${date}`,
      text: 'Please find attached the latest attendee data.',
      attachments: [{
        filename: `attendees-${date}.csv`,
        content: csvData
      }]
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export interface IStorage {
  createAttendee(attendee: InsertAttendee): Promise<Attendee>;
  getAttendees(): Promise<Attendee[]>;
}

export class EmailStorage implements IStorage {
  async createAttendee(attendee: InsertAttendee): Promise<Attendee> {
    console.log('Creating new attendee:', attendee);
    const newAttendee: Attendee = {
      ...attendee,
      id: currentId++,
      groupId: null
    };

    attendees.push(newAttendee);
    console.log('Added attendee to in-memory storage. Total attendees:', attendees.length);

    try {
      // Convert all attendees to CSV and send email
      const csvData = convertToCSV(attendees);
      await sendEmailWithCSV(csvData);
      console.log('Successfully processed attendee submission with email notification');
      return newAttendee;
    } catch (error) {
      console.error('Failed to process attendee submission:', error);
      throw error;
    }
  }

  async getAttendees(): Promise<Attendee[]> {
    return attendees;
  }
}

export const storage = new EmailStorage();