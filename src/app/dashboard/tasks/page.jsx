"use client";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/lib/supabaseClinet";
import React, { useCallback, useEffect, useState } from "react";
import TaskCard from "@/components/TaskCard";
import { Button } from "@/components/ui/button";

export default function Page() {
  const { selectedProject } = useProject();
  const [tasks, setTasks] = useState([]);

  const fetchTasks = useCallback(async () => {
    if (!selectedProject?.id) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", selectedProject.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log(data);

      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    }
  }, [selectedProject?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
      </div>

      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              status={task.status}
              assigned_to={task.assigned_to || []}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
          <h3 className="text-lg font-medium mb-1">No tasks found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            There are no tasks assigned for the selected project.
          </p>
        </div>
      )}
    </div>
  );
}
