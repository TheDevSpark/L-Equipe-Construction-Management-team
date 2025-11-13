"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClinet";

export default function TeamPage() {
  const { user } = useAuth();
  const [weather, setWeather] = useState("");
  const [crewCount, setCrewCount] = useState("45");
  const [activities, setActivities] = useState("");
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completed: 0,
    reportsSubmitted: 0,
  });

  // useEffect(() => {
  //   if (user ) {
  //     fetchDashboardData();
  //   }
  // }, [user]);

  useEffect(() => {
    console.log(user);
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log(user);

      // Fetch user's projects
      const { data: projectMembers, error: membersError } = await supabase
        .from("project_members")
        .select(
          `
          project_id,
          projects (
            id,
            name,
            code,
            status
          )
        `
        )
        .eq("profile_id", user.id);

      if (membersError) throw membersError;

      const userProjects =
        projectMembers?.map((member) => member.projects).filter(Boolean) || [];
      setProjects(userProjects);

      // Fetch issues for user's projects
      if (userProjects.length > 0) {
        const projectIds = userProjects.map((p) => p.id);

        const { data: issuesData, error: issuesError } = await supabase
          .from("issues")
          .select("*")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!issuesError) {
          setIssues(issuesData || []);
        }

        // Fetch daily reports
        const { data: reportsData, error: reportsError } = await supabase
          .from("daily_reports")
          .select("*")
          .in("project_id", projectIds)
          .order("report_date", { ascending: false })
          .limit(5);

        if (!reportsError) {
          setDailyReports(reportsData || []);
        }
      }

      // Calculate stats
      const pendingTasks =
        issues?.filter(
          (issue) => issue.status === "open" || issue.status === "in_progress"
        ).length || 0;
      const completed =
        issues?.filter(
          (issue) => issue.status === "resolved" || issue.status === "closed"
        ).length || 0;
      const reportsSubmitted = dailyReports?.length || 0;

      setStats({
        pendingTasks,
        completed,
        reportsSubmitted,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!projects.length) {
      alert("No projects available. Please contact your administrator.");
      return;
    }

    try {
      const { error } = await supabase.from("daily_reports").insert({
        project_id: projects[0].id, // Use first project for now
        report_date: new Date().toISOString().split("T")[0],
        weather: { condition: weather },
        summary: activities,
        created_by: user.id,
      });

      if (error) throw error;

      // Reset form
      setWeather("");
      setActivities("");

      // Refresh data
      fetchDashboardData();

      alert("Daily report submitted successfully!");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error submitting report. Please try again.");
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
      {/* Welcome Banner */}
      <div className="bg-blue-600 rounded-lg p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.user_metadata.full_name || "User"}
        </h1>
        <p className="text-blue-100">
          You have {stats.pendingTasks} pending tasks for today
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Pending Tasks Card */}
        <div className="bg-white rounded-lg border border-orange-200 p-6 relative">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Pending Tasks
              </h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.pendingTasks}
              </div>
              <p className="text-gray-500 text-sm">Open issues</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-white rounded-lg border border-green-200 p-6 relative">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Completed
              </h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.completed}
              </div>
              <p className="text-gray-500 text-sm">Resolved issues</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Reports Submitted Card */}
        <div className="bg-white rounded-lg border border-blue-200 p-6 relative">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Reports Submitted
              </h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.reportsSubmitted}
              </div>
              <p className="text-gray-500 text-sm">Daily reports</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Submit Daily Report Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <svg
              className="w-5 h-5 text-blue-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">
              Submit Daily Report
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Quick form access</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weather
              </label>
              <input
                type="text"
                placeholder="e.g., Sunny, 72°F"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crew Count
              </label>
              <input
                type="number"
                value={crewCount}
                onChange={(e) => setCrewCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activities
              </label>
              <textarea
                placeholder="Brief summary of today's work..."
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSubmitReport}
            className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Report
          </button>
        </div>

        {/* Upload Progress Photos Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <svg
              className="w-5 h-5 text-purple-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Progress Photos
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Document site progress</p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
            <svg
              className="w-8 h-8 text-gray-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-600 font-medium">Click to upload photos</p>
            <p className="text-gray-500 text-sm mt-1">JPG, PNG (max 10MB)</p>
          </div>

          <button className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
            Upload Photos
          </button>
        </div>
      </div>

      {/* My Assigned Tasks Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            My Assigned Tasks
          </h2>
          <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {stats.pendingTasks} pending
          </span>
        </div>

        <div className="space-y-4">
          {issues.length > 0 ? (
            issues.slice(0, 5).map((issue) => (
              <div
                key={issue.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{issue.title}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-sm text-gray-500">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500 capitalize">
                      {issue.severity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      issue.severity === "high"
                        ? "bg-red-100 text-red-800"
                        : issue.severity === "medium"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                    {issue.status === "open" ? "Start" : "View"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No assigned tasks at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* General Tasks Section */}
      <div className="space-y-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              Update Teams: Outlet cover plate - Room 204
            </h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-sm text-gray-500">Oct 5, 2025</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">Teams</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Medium
            </span>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
              Start
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              Upload progress photos - Foundation work
            </h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-sm text-gray-500">Today</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">Photo Upload</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              High
            </span>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
              Start
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              Review and approve MEP coordination
            </h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-sm text-gray-500">Oct 4, 2025</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">Review</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Medium
            </span>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* My Teams Items Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          My Teams Items
        </h2>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">
                PI-045: Outlet cover plate missing
              </h3>
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                In Progress
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Building A - Level 2, Room 204
            </p>
            <div className="flex space-x-2">
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors">
                Add Photo
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                Mark Complete
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">
                PI-038: Touch-up paint in corridor
              </h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Open
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Building B - Level 3, West Corridor
            </p>
            <div className="flex space-x-2">
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors">
                Add Photo
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                Start Work
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* My Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          My Recent Activity
        </h2>

        <div className="space-y-4">
          {dailyReports.length > 0 ? (
            dailyReports.slice(0, 3).map((report) => (
              <div
                key={report.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Submitted daily report
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(report.report_date).toLocaleDateString()} at{" "}
                      {new Date(report.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to show.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
