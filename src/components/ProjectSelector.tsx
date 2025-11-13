// src/components/ProjectSelector.tsx
"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";

export default function ProjectSelector() {
  const {
    projects = [],
    selectedProject,
    selectProject,
    loading,
  } = useProject();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const project = projects?.find((p) => p.id == e.target.value);
    if (project) {
      selectProject(project);
    }
  };

  // Don't render anything on server-side
  if (!isClient) return null;

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">Loading projects...</div>
      </div>
    );
  }

  // If no projects are available
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">No projects available</div>
      </div>
    );
  }

  // If projects exist but none is selected, select the first one
  if (!selectedProject && projects.length > 0) {
    selectProject(projects[0]);
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center">
          <label
            htmlFor="project-select"
            className="mr-2 text-sm font-medium text-gray-700"
          >
            Project:
          </label>
          <select
            id="project-select"
            value={selectedProject?.id || ""}
            onChange={handleProjectChange}
            className="block w-64 rounded-md border-gray-300 py-1 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-black"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
