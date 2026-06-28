"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useElectionStore } from "@/app/store/useElectionStore";

type Candidate = {
  id: string;
  firstName: string;
  surname: string;
  party: string;
};

export default function DeleteCandidate({
  candidate,
}: {
  candidate: Candidate;
}) {
  const { DeleteCandidate, isDeletingCandidate } = useElectionStore();

  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    const success = await DeleteCandidate(candidate.id);

    if (success) {
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primary">
            Delete Candidate?
          </AlertDialogTitle>

          <AlertDialogDescription>
            You are about to permanently remove{" "}
            <span className="font-semibold text-primary">
              {candidate.firstName} {candidate.surname}
            </span>{" "}
            from this election.
            <br />
            <br />
            Party:{" "}
            <span className="font-medium text-primary">{candidate.party}</span>
            <br />
            Candidate ID:{" "}
            <span className="font-medium text-primary">{candidate.id}</span>
            <br />
            <br />
            This action cannot be undone. Any votes associated with this
            candidate will also be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingCandidate}>
            Cancel
          </AlertDialogCancel>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeletingCandidate}
          >
            {isDeletingCandidate ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting Candidate...
              </>
            ) : (
              "Delete Candidate"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
