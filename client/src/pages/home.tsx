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

        <div>
          <Link href="/quiz">
            <Button className="text-lg px-8 py-6">
              Mesh
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}