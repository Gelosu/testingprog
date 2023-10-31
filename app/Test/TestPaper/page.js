import FacultyAside from "@/components/DefaultFix/FacultyAside";
import TestPaper from "@/components/TestPaper/TestPaper";


export default function DashboardPage() {
  return (
    <main className="container-fluid">
      <div className="row ">
        <FacultyAside/>
        <div className="custom-m col-11 col-md-10 p-0">
          <TestPaper />
        </div>
      </div>
    </main>
  );
}
