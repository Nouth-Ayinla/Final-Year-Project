"use client";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AddCandidateForm from "./_components/AddCandidateForm";
import AdminGuard from "@/components/guard/AdminGuard";

export default function CandidatePage() {
  const { electionId } = useParams<{ electionId: string }>();

  return (
    <AdminGuard>
      <div className="space-y-6">
        <Link
          href={`/election/${electionId}/edit`}
          className={buttonVariants({
            variant: "outline",
          })}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Editing Election
        </Link>
        <AddCandidateForm />
      </div>
    </AdminGuard>
  );
}
