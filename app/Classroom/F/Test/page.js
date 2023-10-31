import FacultyAside from "@/components/DefaultFix/FacultyAside";
import FacultyClassTest from "@/components/FacultyClass/Test";

export default function FacultyTestPage() {
  return (
    <main className="container-fluid">
      <section className="row">
        <FacultyAside />
        <FacultyClassTest />
      </section>
    </main>
  );
}
