import { ReportPage } from "@/features/interview-report/server/components/report-page";

interface InterviewReportPageProps {
  params: Promise<{
    reportId: string;
  }>;
}

export default async function InterviewReportPage({
  params,
}: InterviewReportPageProps) {
  const { reportId } = await params;

  return <ReportPage reportId={reportId} />;
}
