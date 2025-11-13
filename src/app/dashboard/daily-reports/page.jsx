"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { dailyReportsApi } from "@/lib/dailyReportsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon, SearchIcon } from "lucide-react";
import DailyReportForm from "@/components/daily-reports/DailyReportForm";
import { DailyReportCard } from "@/components/daily-reports/DailyReportCard";

export default function DailyReports() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedProject: contextSelectedProject } = useProject();

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Fetch reports and projects
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch daily reports (which includes project data)
      const { data: reportsData, error: reportsError } =
        await dailyReportsApi.getDailyReports();
      if (reportsError) throw reportsError;

      // Extract unique projects from reports
      const projectMap = new Map();
      reportsData?.forEach((report) => {
        if (report.projects) {
          projectMap.set(report.project_id, report.projects);
        }
      });

      setProjects(Array.from(projectMap.values()));
      setReports(reportsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (reportData) => {
    try {
      if (editingReport) {
        // Update existing report
        const { error } = await dailyReportsApi.updateDailyReport(
          editingReport.id,
          reportData
        );
        if (error) throw error;
      } else {
        // Create new report
        const { error } = await dailyReportsApi.createDailyReport({
          ...reportData,
          created_by: user.id,
        });
        if (error) throw error;
      }

      // Refresh the reports list
      await fetchData();
      setShowForm(false);
      setEditingReport(null);
    } catch (error) {
      console.error("Error saving report:", error);
    }
  };

  // Handle report deletion
  const handleDelete = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        const { error } = await dailyReportsApi.deleteDailyReport(reportId);
        if (error) throw error;

        // Refresh the reports list
        await fetchData();
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  };

  // Filter reports based on search term and selected project from context
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.work_summary?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (report.work_completed?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (report.projects?.projectName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    // If a project is selected in the context, filter by it
    const matchesProject = contextSelectedProject
      ? report.project_id === contextSelectedProject.id
      : true;

    return matchesSearch && matchesProject;
  });
  useEffect(() => {
    console.log(filteredReports);
  });
  // Get unique project options for the filter
  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: project.projectName || `Project ${project.id}`,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Reports</h1>
          <p className="text-muted-foreground">
            Track and manage your daily construction reports
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <PlusIcon className="w-4 h-4" />
          <span>New Report</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Reports</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by summary, work completed..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Filter by Project</Label>
              <select
                id="project"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">All Projects</option>
                {projectOptions.map((project) => (
                  <option key={project.value} value={project.value}>
                    {project.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-muted p-4">
                <SearchIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No reports found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || selectedProject
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by creating a new daily report"}
                </p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <DailyReportCard
              key={report.id}
              report={report}
              onEdit={() => {
                setEditingReport(report);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Report Form Modal */}
      {showForm && (
        <DailyReportForm
          report={editingReport}
          projects={projects}
          onClose={() => {
            setShowForm(false);
            setEditingReport(null);
          }}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
