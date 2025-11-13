"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClinet";
import TaskCompletion from "./TaskCompletion";

function TaskCard({ title, description, status, assigned_to = [], id }) {
  const [userProfiles, setUserProfiles] = useState({});
  const [taskId, setTaskId] = useState(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (!assigned_to || assigned_to.length === 0) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", assigned_to);

        if (error) throw error;

        setUserProfiles(
          data.reduce(
            (acc, user) => ({
              ...acc,
              [user.id]: user,
            }),
            {}
          )
        );
      } catch (error) {
        console.error("Error fetching user profiles:", error);
      }
    };

    fetchUserProfiles();
  }, [assigned_to]);

  return (
    <Card className="w-full md:w-[350px] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge
            className={
              status === "pending"
                ? "bg-amber-400 hover:bg-amber-400/80"
                : status === "completed"
                ? "bg-green-400 hover:bg-green-400/80"
                : "bg-red-400 hover:bg-red-400/80"
            }
          >
            {status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-1">
          <span className="text-sm font-medium">Assigned to:</span>
          {assigned_to?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {assigned_to.map((userId) => {
                const user = userProfiles[userId];
                // console.log(user);
                return (
                  <span
                    key={userId}
                    className="text-sm bg-muted px-2 py-1 rounded"
                  >
                    {user?.full_name}
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              No one assigned
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex w-full justify-between">
        {status === "pending" && (
          <Button
            className="bg-green-500"
            onClick={() => {
              setOpen(true);
              setTaskId(id);
            }}
          >
            Change Status
          </Button>
        )}
      </CardFooter>
      <TaskCompletion open={open} onOpenChange={setOpen} id={taskId} />
    </Card>
  );
}

export default TaskCard;
