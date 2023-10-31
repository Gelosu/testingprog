import StudentAside from "@/components/DefaultFix/StudentAside";
import ReportProblem from "@/components/Report Problem/Report";

export default function FacultyReportPage() {
  return (
    <main className="container-fluid">
      <section className="row">
        <StudentAside/>
        <ReportProblem/>
      </section>
    </main>
  );
}
