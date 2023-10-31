import FacultyAside from "@/components/DefaultFix/FacultyAside";
import FacultyClassStudent from "@/components/FacultyClass/Students";

export default function FacultyTestPage() {
  return (
    <main className="container-fluid">
      <section className="row">
        <FacultyAside />
        <FacultyClassStudent/>
      </section>
    </main>
  );
}
