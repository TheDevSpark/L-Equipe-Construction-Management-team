"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClinet";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

export default function Schedule() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // useEffect(() => {
  //   if (user) {
  //     fetchProjects();
  //   }
  // }, [user]);

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch project schedules
        const { data, error } = await supabase
          .from("project_schedules")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setScheduleData(data[0].data || []);
        }
      } catch (error) {
        console.error("Error fetching schedule data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [user]);

  // const fetchProjects = async () => {
  //   try {
  //     setLoading(true);

  //     // Fetch user's projects
  //     const { data: projectMembers, error: membersError } = await supabase
  //       .from("project_members")
  //       .select(
  //         `
  //         project_id,
  //         role,
  //         projects (
  //           id,
  //           name,
  //           code,
  //           description,
  //           status,
  //           start_date,
  //           end_date,
  //           created_at
  //         )
  //       `
  //       )
  //       .eq("profile_id", user.id);

  //     if (membersError) throw membersError;

  //     const userProjects =
  //       projectMembers
  //         ?.map((member) => ({
  //           ...member.projects,
  //           userRole: member.role,
  //         }))
  //         .filter(Boolean) || [];

  //     setProjects(userProjects);

  //     if (userProjects.length > 0) {
  //       setSelectedProject(userProjects[0]);
  //       fetchMilestones(userProjects[0].id);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching projects:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchMilestones = async (projectId) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("milestones")
  //       .select("*")
  //       .eq("project_id", projectId)
  //       .order("sort_index", { ascending: true });

  //     if (error) throw error;
  //     setMilestones(data || []);
  //   } catch (error) {
  //     console.error("Error fetching milestones:", error);
  //   }
  // };

  const handleProjectChange = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    setSelectedProject(project);
    fetchMilestones(projectId);
  };

  const handleFullscreen = () => {
    const elem = document.getElementById("gantt-container");
    if (!document.fullscreenElement) {
      elem?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert schedule data to Gantt format
  const tasks = useMemo(() => {
    if (!scheduleData || !Array.isArray(scheduleData)) return [];

    return scheduleData.map((task, index) => ({
      start: new Date(task.start),
      end: new Date(task.end),
      name: task.name || `Task ${index + 1}`,
      id: task.id || `task-${index}`,
      progress: task.progress || 0,
      type: "task",
      dependencies: task.dependencies ? [task.dependencies] : [],
    }));
  }, [scheduleData]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (scheduleData.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Project Schedule</h1>
          <p className="text-gray-600">No schedule data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project Schedule</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleFullscreen}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Print
          </button>
        </div>
      </div>

      <div
        id="gantt-container"
        className="bg-white rounded-lg shadow p-4 w-[70vw] overflow-scroll "
      >
        <div className="gantt-container" style={{ height: "70vh" }}>
          <Gantt
            tasks={tasks}
            viewMode={ViewMode.Week}
            listCellWidth=""
            columnWidth={65}
            barFill={60}
            barCornerRadius={4}
            rowHeight={45}
            fontSize="12"
            listItemHeight={45}
            todayColor="rgba(252, 248, 227, 0.5)"
            barProgressColor="#38a169"
            barProgressSelectedColor="#2f855a"
            barBackgroundColor="#4299e1"
            barBackgroundSelectedColor="#3182ce"
            projectBackgroundColor="#9f7aea"
            projectBackgroundSelectedColor="#805ad5"
            projectProgressColor="#6b46c1"
            projectProgressSelectedColor="#553c9a"
          />
        </div>
      </div>
    </div>
  );
}
