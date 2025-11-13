import { supabase } from "./supabaseClinet";

// Utility functions
export const dailyReportsUtils = {
  // Format date for display
  formatDate: (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  // Get status color based on status
  getStatusColor: (status) => {
    const statusColors = {
      draft: "bg-yellow-100 text-yellow-800",
      submitted: "bg-blue-100 text-blue-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  },

  // Get status icon
  getStatusIcon: (status) => {
    const statusIcons = {
      draft: "📝",
      submitted: "📤",
    };
    return statusIcons[status] || "📄";
  },

  // Calculate report completeness percentage
  calculateCompleteness: (report) => {
    if (!report) return 0;

    const requiredFields = ["work_summary", "work_completed", "total_workers"];

    const completedFields = requiredFields.filter(
      (field) =>
        report[field] !== null &&
        report[field] !== undefined &&
        report[field] !== ""
    ).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  },
};

// Daily Reports API
export const dailyReportsApi = {
  // Get all daily reports
  async getDailyReports(projectId = null) {
    try {
      console.log(projectId);

      const { data, error } = await supabase.from("daily_reports").select("*");

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching daily reports:", error);
      return { data: null, error };
    }
  },

  // Get daily report by ID
  async getDailyReport(reportId) {
    try {
      const { data, error } = await supabase
        .from("daily_reports")
        .select(
          `
          *,
          projects (
            id,
            projectName
          )
        `
        )
        .eq("id", reportId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching daily report:", error);
      return { data: null, error };
    }
  },

  // Create a new daily report
  async createDailyReport(reportData) {
    try {
      const { data, error } = await supabase
        .from("daily_reports")
        .insert([
          {
            ...reportData,
            status: "submitted",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error creating daily report:", error);
      return { data: null, error };
    }
  },

  // Update a daily report
  async updateDailyReport(reportId, updates) {
    try {
      const { data, error } = await supabase
        .from("daily_reports")
        .update(updates)
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error updating daily report:", error);
      return { data: null, error };
    }
  },

  // Delete a daily report
  async deleteDailyReport(reportId) {
    try {
      const { error } = await supabase
        .from("daily_reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error deleting daily report:", error);
      return { error };
    }
  },

  // Get reports for a specific project
  async getProjectReports(projectId) {
    try {
      const { data, error } = await supabase
        .from("daily_reports")
        .select("*")
        .eq("project_id", projectId)
        .order("report_date", { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching project reports:", error);
      return { data: null, error };
    }
  },
};
