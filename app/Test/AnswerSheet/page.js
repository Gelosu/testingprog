import FacultyAside from "@/components/DefaultFix/FacultyAside";
import AnswerSheet from "@/components/TestPaper/AnswerSheet";

export default function AnswerSheetPage() {
  return (
    <main className="container-fluid">
      <div className="row ">
        <FacultyAside />
        <div className="custom-m col-11 col-md-10 p-0">
          <AnswerSheet />
        </div>
        
      </div>
    </main>
  );
}
