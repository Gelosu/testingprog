"use client";
import StudentSetting from "@/components/Account Setting/StudentSettings";
import StudentAside from "@/components/DefaultFix/StudentAside";


export default function FacultyReportPage() {
  return (
    <main className="container-fluid">
      <section className="row">
        <StudentAside />
        <StudentSetting/>
      </section>
    </main>
  );
}
