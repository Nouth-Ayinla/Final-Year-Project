import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RegisteredVoters from "./_components/RegisteredVoters";

export default function VotersPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Voters Management
        </h1>

        <p className="text-muted-foreground text-sm">
          Manage election voters and control access to OndoDecide.
        </p>
      </div>

      {/* Flat List Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Registered Voters</CardTitle>
          <CardDescription>
            View and manage all registered voters.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RegisteredVoters />
        </CardContent>
      </Card>
    </div>
  );
}
