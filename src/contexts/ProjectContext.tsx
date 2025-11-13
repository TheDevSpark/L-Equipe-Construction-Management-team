// src/context/ProjectContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClinet';

interface TeamMember {
  id: string;
  role: string;
}

interface Project {
  id: string;
  projectName: string;
  team_members: TeamMember[];
  [key: string]: any;
}

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  selectProject: (project: Project) => void;
  setSelectedProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAvailableProjects = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('project')
        .select('*');

      if (error) throw error;

      // Filter projects where the user is in the team_members array
      const availableProjects = data.filter(project => 
        project.team_members?.some((member: TeamMember) => member.id === user.id)
      );
      
      setProjects(availableProjects || []);
      
      if (availableProjects?.length > 0 && !selectedProject) {
        setSelectedProject(availableProjects[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableProjects();
  }, []);

  const selectProject = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      selectedProject, 
      loading, 
      selectProject,
      setSelectedProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};