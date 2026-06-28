import AdminGuard from "@/components/guard/AdminGuard";
import CreateElectionForm from "./_components/CreateElectionForm";

export default function CreateElection() {
  return (
    <AdminGuard>
      <CreateElectionForm />
    </AdminGuard>
  );
}
