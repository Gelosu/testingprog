import FacultyAside from "@/components/DefaultFix/FacultyAside";
import FacultyReportProblem from "@/components/Report Problem/Faculty";

export default function FacultyReportPage() {
  return (
    <main className="container-fluid">
      <section className="row">
        <FacultyAside />
        <FacultyReportProblem/>
      </section>
    </main>
  );
}
