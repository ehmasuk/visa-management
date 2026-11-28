"use client";

import { Pencil } from "lucide-react";
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

/**
 * Shared Edit button + modal form for a name-only registry record.
 * The update action is passed in from the server page so every registry keeps
 * its own authorization and duplicate-name validation.
 */
export function RegistryEditDialog({
  item,
  label,
  title,
  description,
  updateAction,
}: {
  item: { id: string; name: string };
  label: string;
  title: string;
  description: string;
  updateAction: (formData: FormData) => Promise<void>;
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
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <form action={updateAction} className="flex flex-col gap-4 mt-2">
          <input type="hidden" name="id" value={item.id} />
          <Field label={label} name="name" defaultValue={item.name} />
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
