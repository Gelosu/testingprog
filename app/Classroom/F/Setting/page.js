"use client"
import FacultySetting from "@/components/Account Setting/FacultySetting";
import FacultyAside from "@/components/DefaultFix/FacultyAside";


export default function FacultyReportPage() {
  return (
    <main className="container-fluid">
      <section className="row">
        <FacultyAside />
        <FacultySetting/>
      </section>
    </main>
  );
}
