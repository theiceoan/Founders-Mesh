import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Welcome to Founders Mesh
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Join tailored networking events and connect with like-minded professionals
        </p>

        <div className="space-x-4">
          <Link href="/quiz">
            <Button className="text-lg px-8 py-6">
              Join an Event
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="text-lg px-8 py-6">
              Organizer Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}