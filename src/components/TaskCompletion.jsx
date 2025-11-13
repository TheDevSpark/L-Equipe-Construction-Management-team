import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabaseClinet";

function TaskCompletion({ open, onOpenChange, id }) {
  const [notes, setNotes] = useState("");
  const changeStatus = async (status) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status, notes })
      .eq("id", id);
    if (error) {
      console.error("Error updating task status:", error);
    }
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Notes</DialogTitle>
          <DialogDescription>Enter task notes</DialogDescription>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />
        </DialogHeader>
        <DialogFooter className="flex justify-between w-full">
          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={() => changeStatus("completed")}
          >
            Mark as Completed
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => changeStatus("not_completed")}
          >
            Mark as Not Completed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaskCompletion;
