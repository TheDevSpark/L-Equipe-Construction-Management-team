"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { dailyReportsApi } from "@/lib/dailyReportsApi";

export default function DailyReportForm({
  report = null,
  projects = [],
  onClose,
  onSuccess,
}) {
  const isEditing = !!report;
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    project_id: report?.project_id || "",
    report_date: report?.report_date || new Date().toISOString().split("T")[0],
    weather_condition: report?.weather_condition || "",
    work_summary: report?.work_summary || "",
    work_completed: report?.work_completed || "",
    work_in_progress: report?.work_in_progress || "",
    work_scheduled: report?.work_scheduled || "",
    delays_reasons: report?.delays_reasons || "",
    total_workers: report?.total_workers || "",
    total_work_hours: report?.total_work_hours || "",
    photos_urls: report?.photos_urls || [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing) {
        const { error } = await dailyReportsApi.updateDailyReport(report.id, {
          ...formData,
          status: 'submitted',
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
        toast.success("Report updated successfully!");
      } else {
        const { error } = await dailyReportsApi.createDailyReport({
          ...formData,
          status: 'submitted'
        });
        if (error) throw error;
        toast.success("Report created successfully!");
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error(error.message || "Error saving report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // In a real app, you would upload files to storage here
    // For now, we'll just create object URLs for local preview
    const newPhotos = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      photos_urls: [...(prev.photos_urls || []), ...newPhotos]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      photos_urls: prev.photos_urls.filter((_, i) => i !== index)
    }));
  };

  const openImage = (url, index) => {
    setSelectedImage(url);
    setCurrentImageIndex(index);
  };

  const handlePrevImage = () => {
    const newIndex = (currentImageIndex - 1 + formData.photos_urls.length) % formData.photos_urls.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(formData.photos_urls[newIndex]);
  };

  const handleNextImage = () => {
    const newIndex = (currentImageIndex + 1) % formData.photos_urls.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(formData.photos_urls[newIndex]);
  };

  // Handle keyboard navigation for image gallery
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentImageIndex]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card text-card-foreground rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border my-3 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            {isEditing ? "Edit Daily Report" : "Create Daily Report"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Gallery */}
          {formData.photos_urls?.length > 0 && (
            <div className="space-y-2">
              <Label>Report Photos</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {formData.photos_urls.map((url, index) => (
                  <div key={index} className="relative group">
                    <button
                      type="button"
                      onClick={() => openImage(url, index)}
                      className="w-full h-24 rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all"
                    >
                      <img
                        src={url}
                        alt={`Report photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="project_id">Project *</Label>
              <select
                id="project_id"
                name="project_id"
                value={formData.project_id}
                onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="report_date">Report Date *</Label>
              <Input
                id="report_date"
                name="report_date"
                type="date"
                value={formData.report_date}
                onChange={(e) => setFormData(prev => ({ ...prev, report_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="weather_condition">Weather</Label>
              <select
                id="weather_condition"
                name="weather_condition"
                value={formData.weather_condition}
                onChange={(e) => setFormData(prev => ({ ...prev, weather_condition: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select Weather</option>
                <option value="sunny">Sunny</option>
                <option value="cloudy">Cloudy</option>
                <option value="rainy">Rainy</option>
                <option value="stormy">Stormy</option>
                <option value="foggy">Foggy</option>
              </select>
            </div>
          </div>

          {/* Work Summary */}
          <div>
            <Label htmlFor="work_summary">Work Summary *</Label>
            <Textarea
              id="work_summary"
              name="work_summary"
              value={formData.work_summary}
              onChange={(e) => setFormData(prev => ({ ...prev, work_summary: e.target.value }))}
              className="w-full mt-1"
              rows={3}
              placeholder="Brief summary of today's work..."
              required
            />
          </div>

          {/* Work Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="work_completed">Work Completed Today *</Label>
              <Textarea
                id="work_completed"
                name="work_completed"
                value={formData.work_completed}
                onChange={(e) => setFormData(prev => ({ ...prev, work_completed: e.target.value }))}
                className="w-full mt-1"
                rows={4}
                placeholder="Detail what work was completed today..."
                required
              />
            </div>
            <div>
              <Label htmlFor="work_in_progress">Work In Progress</Label>
              <Textarea
                id="work_in_progress"
                name="work_in_progress"
                value={formData.work_in_progress}
                onChange={(e) => setFormData(prev => ({ ...prev, work_in_progress: e.target.value }))}
                className="w-full mt-1"
                rows={4}
                placeholder="Work currently in progress..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="work_scheduled">Work Scheduled for Tomorrow</Label>
            <Textarea
              id="work_scheduled"
              name="work_scheduled"
              value={formData.work_scheduled}
              onChange={(e) => setFormData(prev => ({ ...prev, work_scheduled: e.target.value }))}
              className="w-full mt-1"
              rows={3}
              placeholder="Planned work for tomorrow..."
            />
          </div>

          <div>
            <Label htmlFor="delays_reasons">Delays and Reasons</Label>
            <Textarea
              id="delays_reasons"
              name="delays_reasons"
              value={formData.delays_reasons}
              onChange={(e) => setFormData(prev => ({ ...prev, delays_reasons: e.target.value }))}
              className="w-full mt-1"
              rows={3}
              placeholder="Report any delays and their reasons..."
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Upload Photos</Label>
            <div className="flex flex-col space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="block w-full text-sm text-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Upload photos of the work progress (max 5MB per image)
              </p>
            </div>
          </div>

          {/* Progress and Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="total_workers">Total Workers *</Label>
              <Input
                id="total_workers"
                name="total_workers"
                type="number"
                min="0"
                value={formData.total_workers}
                onChange={(e) => setFormData(prev => ({ ...prev, total_workers: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="total_work_hours">Total Work Hours</Label>
              <Input
                id="total_work_hours"
                name="total_work_hours"
                type="number"
                step="0.5"
                min="0"
                value={formData.total_work_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, total_work_hours: e.target.value }))}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Report" : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            onClick={handlePrevImage}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          
          <div className="max-w-full max-h-[90vh] flex items-center justify-center">
            <img
              src={selectedImage}
              alt={`Report image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
          
          <button
            onClick={handleNextImage}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Next image"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          
          <div className="absolute bottom-4 text-white text-sm">
            {currentImageIndex + 1} of {formData.photos_urls.length}
          </div>
        </div>
      )}
    </div>
  );
}
