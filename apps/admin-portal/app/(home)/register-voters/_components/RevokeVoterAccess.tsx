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

import { useAuthStore } from "@/app/store/useAuthStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

type Voter = {
  id: string;
  firstName: string;
  surname: string;
  voterId: string;
};

export default function RevokeVoterAccess({ voter }: { voter: Voter }) {
  const { DeleteVoter, isDeletingVoter } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    const success = await DeleteVoter(voter.id);

    if (success) {
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke Voter access?</AlertDialogTitle>

          <AlertDialogDescription>
            This will permanently remove{" "}
            <span className="font-medium text-primary">
              {voter.firstName} {voter.surname}
            </span>{" "}
            (ID: <span className="font-medium">{voter.voterId}</span>) from the
            system.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingVoter}>
            Cancel
          </AlertDialogCancel>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeletingVoter}
          >
            {isDeletingVoter ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin size-4" />
                Revoking...
              </div>
            ) : (
              "Revoke Access"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
