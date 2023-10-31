import FacultyAside from "@/components/DefaultFix/FacultyAside";
import AnswerKey from "@/components/TestPaper/AnswerKey";

export default function AnswerSheetPage(){
    return(
        <main className="container-fluid">
        <div className="row ">
            <FacultyAside/>
          <div className="custom-m col-11 col-md-10 p-0">
            <AnswerKey/>
          </div>
        </div>
      </main>
    )
}