"use client";

import { Pencil } from "lucide-react";
import { updateStaff } from "@/app/actions/registry";
import { Field, SubmitButton } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Edit button + modal form for a staff allow-list record. */
export function StaffEditDialog({
  member,
}: {
  member: { id: string; name: string; gmail: string };
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Pencil className="size-3.5 text-muted-foreground" />
            Edit
          </Button>
        }
      />
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Edit staff member</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update the name and Gmail allow-list address. Staff role is fixed by the registry.
          </DialogDescription>
        </DialogHeader>
        <form action={updateStaff} className="flex flex-col gap-4 mt-2">
          <input type="hidden" name="id" value={member.id} />
          <Field label="Staff name" name="name" defaultValue={member.name} />
          <Field label="Gmail address" name="gmail" type="email" defaultValue={member.gmail} />
          <DialogFooter className="mt-2">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <SubmitButton>Save changes</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
