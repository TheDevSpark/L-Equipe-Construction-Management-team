'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../../lib/supabaseClinet';

export default function Schedule() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (user && profile) {
      fetchProjects();
    }
  }, [user, profile]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch user's projects
      const { data: projectMembers, error: membersError } = await supabase
        .from('project_members')
        .select(`
          project_id,
          role,
          projects (
            id,
            name,
            code,
            description,
            status,
            start_date,
            end_date,
            created_at
          )
        `)
        .eq('profile_id', user.id);

      if (membersError) throw membersError;

      const userProjects = projectMembers?.map(member => ({
        ...member.projects,
        userRole: member.role
      })).filter(Boolean) || [];
      
      setProjects(userProjects);
      
      if (userProjects.length > 0) {
        setSelectedProject(userProjects[0]);
        fetchMilestones(userProjects[0].id);
      }

    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async (projectId) => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_index', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const handleProjectChange = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project);
    fetchMilestones(projectId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'On Track': return 'bg-blue-100 text-blue-800';
      case 'At Risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Management</h1>
        <p className="text-gray-600">Manage your construction projects and milestones</p>
      </div>

      {/* Project Selection */}
      {projects.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Project
          </label>
          <select
            value={selectedProject?.id || ''}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedProject ? (
        <>
          {/* Project Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedProject.name}</h2>
                <p className="text-gray-600">{selectedProject.code}</p>
                <p className="text-gray-500 text-sm mt-2">{selectedProject.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProjectStatusColor(selectedProject.status)}`}>
                {selectedProject.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">
                  {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">
                  {selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Your Role</p>
                <p className="font-medium capitalize">{selectedProject.userRole}</p>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors">
                Add Milestone
              </button>
            </div>

            {milestones.length > 0 ? (
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                            {milestone.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Category: {milestone.category}</span>
                          {milestone.target_date && (
                            <span>Target: {new Date(milestone.target_date).toLocaleDateString()}</span>
                          )}
                          {milestone.day_label && (
                            <span>Day: {milestone.day_label}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No milestones found for this project.</p>
                <button className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm">
                  Add the first milestone
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
          <p className="text-gray-500 mb-4">You don't have access to any projects yet.</p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Contact Administrator
          </button>
        </div>
      )}
    </div>
  );
}
