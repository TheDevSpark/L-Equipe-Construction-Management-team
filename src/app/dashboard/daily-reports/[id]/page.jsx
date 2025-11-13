"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  MapPinIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { dailyReportsApi } from "@/lib/dailyReportsApi";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClinet";

export default function DailyReportDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Initialize with empty array to avoid conditional hook calls
  const photos = report ? (report.photos_urls || report.photos || []) : [];
  
  const openImage = useCallback((imageUrl, index) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
  }, []);
  
  const closeImage = useCallback(() => {
    setSelectedImage(null);
  }, []);
  
  const handlePrevImage = useCallback(() => {
    const newIndex = (currentImageIndex - 1 + photos.length) % photos.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(photos[newIndex]?.url || photos[newIndex]);
  }, [currentImageIndex, photos]);
  
  const handleNextImage = useCallback(() => {
    const newIndex = (currentImageIndex + 1) % photos.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(photos[newIndex]?.url || photos[newIndex]);
  }, [currentImageIndex, photos]);
  
  // Handle keyboard navigation for image gallery
  useEffect(() => {
    if (!selectedImage) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, handleNextImage, handlePrevImage, closeImage]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("daily_reports")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        console.log(data);

        setReport(data);
      } catch (err) {
        console.error("Failed to fetch report:", err);
        setError("Failed to load report. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Report not found</p>
        <Button
          onClick={() => router.push("/dashboard/daily-reports")}
          variant="outline"
        >
          Back to Reports
        </Button>
      </div>
    );
  }

  const projectName =
    report?.projects?.projectName || report?.project?.name || "No Project";
  const reportDate = report?.report_date || report?.created_at;
  const workHours = report?.total_work_hours || report?.hours_worked || 0;
  const workerCount = report?.total_workers || 0;

  return (
    <div className="container mx-auto p-4 space-y-6 relative">
      {/* Fullscreen Image Viewer */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={closeImage}
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
            {currentImageIndex + 1} of {photos.length}
          </div>
        </div>
      )}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Report</h1>
          <p className="text-muted-foreground">Viewing report details</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{projectName}</h2>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {new Date(reportDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </div>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {report.status?.charAt(0).toUpperCase() +
                  report.status?.slice(1) || "Submitted"}
              </div>
            </div>
          </div>

          {/* Weather and Location */}
          {(report.weather_condition || report.location) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.weather_condition && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Weather</h3>
                  <p className="capitalize">{report.weather_condition}</p>
                </div>
              )}
              {report.location && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    Location
                  </h3>
                  <p>{report.location}</p>
                </div>
              )}
            </div>
          )}

          {/* Work Summary */}
          <div>
            <h3 className="text-lg font-medium mb-2">Work Summary</h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="whitespace-pre-line">
                {report.work_summary || report.summary || "No summary provided"}
              </p>
            </div>
          </div>

          {/* Work Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Work Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <UsersIcon className="w-4 h-4 mr-1" />
                  Workers
                </h4>
                <p>{workerCount} workers</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Hours Worked
                </h4>
                <p>{workHours} hours</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Work Status</h4>
                <div className="capitalize bg-primary/10 text-primary text-sm px-2 py-1 rounded-full inline-block">
                  {report.status || 'submitted'}
                </div>
              </div>
            </div>

            {/* Work Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.work_completed && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Work Completed</h4>
                  <p className="whitespace-pre-line">{report.work_completed}</p>
                </div>
              )}

              {report.work_in_progress && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Work In Progress</h4>
                  <p className="whitespace-pre-line">{report.work_in_progress}</p>
                </div>
              )}

              {report.work_scheduled && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Scheduled Work</h4>
                  <p className="whitespace-pre-line">{report.work_scheduled}</p>
                </div>
              )}

              {report.delays_reasons && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Delays & Reasons</h4>
                  <p className="whitespace-pre-line">{report.delays_reasons}</p>
                </div>
              )}
            </div>
          </div>

          {/* Issues and Next Steps */}
          {(report.issues_encountered || report.next_steps) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.issues_encountered && (
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Issues Encountered
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="whitespace-pre-line">
                      {report.issues_encountered}
                    </p>
                  </div>
                </div>
              )}
              {report.next_steps && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Next Steps</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="whitespace-pre-line">{report.next_steps}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Photos */}
          {photos.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                Photos ({photos.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo, index) => {
                  const url = typeof photo === "string" ? photo : photo.url;
                  return (
                    <div
                      key={index}
                      className="rounded-lg overflow-hidden border relative group cursor-zoom-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        openImage(url, index);
                      }}
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={url}
                          alt={`Report photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
