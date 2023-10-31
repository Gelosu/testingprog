import FacultyAside from "@/components/DefaultFix/FacultyAside";
import ReportProblem from "@/components/Report Problem/Report";

export default function FacultyReportPage() {
  return (
    <main className="container-fluid">
      <section className="row">
        <FacultyAside />
        <ReportProblem/>
      </section>
    </main>
  );
}
