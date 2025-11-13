"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { dailyReportsUtils } from "@/lib/dailyReportsApi";
import { CalendarIcon, UsersIcon, ClockIcon } from "lucide-react";
import { useEffect } from "react";

export function DailyReportCard({ report, onView }) {
  const router = useRouter();
  const status = report?.status || "submitted";
  const statusColor = dailyReportsUtils.getStatusColor(status);
  const statusIcon = dailyReportsUtils.getStatusIcon(status);

  const handleCardClick = (e) => {
    e.preventDefault();
    if (onView) {
      onView(report);
    } else {
      router.push(`/dashboard/daily-reports/${report.id}`);
    }
  };
  useEffect(() => {
    console.log(report);
  });
  return (
    <div
      className="border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            {/* Photo preview */}
            {(report.photos_urls?.length > 0 || report.photos?.length > 0) && (
              <div className="mt-3">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {(report.photos_urls || report.photos || [])
                    .slice(0, 3)
                    .map((photo, index) => {
                      const url = typeof photo === "string" ? photo : photo.url;
                      return (
                        <div
                          key={index}
                          className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border"
                        >
                          <img
                            src={url}
                            alt={`Report ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    })}
                  {(report.photos_urls?.length > 3 ||
                    report.photos?.length > 3) && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                      +
                      {(report.photos_urls?.length ||
                        report.photos?.length ||
                        0) - 3}{" "}
                      more
                    </div>
                  )}
                </div>
              </div>
            )}
            <h3 className="font-medium text-lg">
              {report?.work_summary || "No Project"}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {dailyReportsUtils.formatDate(
                report.report_date || report.created_at
              )}
            </div>
          </div>
          <Badge className={`${statusColor} flex items-center gap-1`}>
            <span>{statusIcon}</span>
            <span className="capitalize">{status}</span>
          </Badge>
        </div>

        {report.weather_condition && (
          <div className="text-sm">
            <span className="font-medium">Weather: </span>
            <span className="capitalize">{report.weather_condition}</span>
          </div>
        )}

        <div className="py-2">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {report.work_in_progress || "No summary provided"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <UsersIcon className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{report.total_workers || 0} workers</span>
          </div>
          {(report.total_work_hours > 0 || report.hours_worked > 0) && (
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>
                {report.total_work_hours || report.hours_worked} hours
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
