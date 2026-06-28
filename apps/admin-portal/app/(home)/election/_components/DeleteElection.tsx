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

type Election = {
  id: string;
  title: string;
  endDate: string;
  _count?: {
    votes: number;
  };
};

export default function DeleteElection({ election }: { election: Election }) {
  const { DeleteElection, isDeletingElection } = useElectionStore();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    const success = await DeleteElection(election.id);

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
          <AlertDialogTitle className="text-destructive">
            Delete Election
          </AlertDialogTitle>

          <div className="space-y-3 text-sm text-muted-foreground">
            <AlertDialogDescription asChild>
              <p>
                You are about to permanently delete{" "}
                <span className="font-semibold text-primary">
                  {election.title}
                </span>
                . This action cannot be undone.
              </p>
            </AlertDialogDescription>

            <p>
              This election is scheduled to end on{" "}
              <span className="font-medium text-foreground">
                {new Date(election.endDate).toLocaleString()}
              </span>
            </p>

            <p>
              Total Votes:{" "}
              <span className="font-semibold text-primary">
                {election._count?.votes ?? 0}
              </span>
            </p>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingElection}>
            Cancel
          </AlertDialogCancel>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeletingElection}
          >
            {isDeletingElection ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Election"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
