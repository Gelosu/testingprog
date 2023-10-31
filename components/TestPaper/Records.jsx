export default function Records() {
  return (
    <main className="container-fluid p-sm-4 py-3 h-100">
      <section className="h-100">
        <div className="d-flex ">
          <a className="align-self-center" href="/Classroom/F/Test">
            <img src="/back-arrow.png" />
          </a>
          &nbsp;
          <h3 className="m-0">&#123;TEST NO&#125;&#58;&#123;TEST NAME&#125;</h3>
        </div>
        <ul className="d-flex flex-wrap justify-content-around mt-3 list-unstyled">
          <a href="/Test/TestPaper" className="text-decoration-none link-dark">
            <li className="m-0 fs-5">TEST PAPER</li>
          </a>
          <a>
            <li className="m-0 fs-5">ANSWER SHEET</li>
          </a>
          <a href="/Test/AnswerKey" className="text-decoration-none link-dark">
            <li className="m-0 fs-5">ANSWER KEY</li>
          </a>
          <a href="/Test/Records" className="text-decoration-none link-dark">
            <li className="m-0 text-decoration-underline fs-5">RECORDS</li>
          </a>
        </ul>
        {/* CONTENT */}
        <section className="container col-12 col-xl-7 mt-5 py-4 col-10 px-3 border border-dark rounded h-75">
          <div className="border border-dark rounded h-100 overflow-auto">
            <ul className="d-flex justify-content-around list-unstyled text-center " >
                <li className="col-sm-3 col-7 border border-dark custom-round1 text-break px-2 py-3">STUDENT ID</li>
                <li className="col-sm-3 col-7 border border-dark text-break px-2 py-3">STUDENT NAME</li>
                <li className="col-sm-2 col-7 border border-dark text-break px-2 py-3">NO. OF CORRECT</li>
                <li className="col-sm-2 col-7 border border-dark text-break px-2 py-3">WRONG QUESTIONS</li>
                <li className="col-sm-2 col-7 border border-dark custom-round2 text-break px-2 py-3">TOTAL SCORE</li>
            </ul>
          </div>
        </section>
        {/* END CONTENT */}
      </section>
    </main>
  );
}
