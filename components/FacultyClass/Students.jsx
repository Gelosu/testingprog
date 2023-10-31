"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function FacultyClassStudent() {
  const [studlist, setStudlist] = useState([]);
  const searchparams = useSearchParams();
  const [search, setSearch] = useState("");
  const classname = searchparams.get("classname");
  const classcode = searchparams.get("classcode");
  const subjectname = searchparams.get("subjectname");

  useEffect(() => {
    if (classcode) {
      fetchStudents(classcode);
    }
  }, [classcode]);

  const fetchStudents = async (classcode) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/getstudents/${classcode}`
      );
      setStudlist(response.data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudlist([]);
    }
  };

  const deleteStudents = async (TUPCID) => {
    try {
      await axios.delete(
        `http://localhost:3001/deleteStudent/${TUPCID}/${classcode}`
      );
      fetchStudents(classcode);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="col-11 col-md-10 p-0">
      <section className="container-fluid p-sm-4 py-3 ">
        <h3 className="d-flex align-items-center gap-2 text-decoration-none link-dark">
          <a href="/Classroom/F" className="align-self-center pb-1">
            <img src="/back-arrow.svg" height={30} width={40} />
          </a>
          <span>
            {classname} CLASSCODE: {classcode} SUBJECT: {subjectname}
          </span>
        </h3>
        <div className="d-flex py-3 justify-content-between">
          <div className="d-flex gap-3">
            <Link
              href={{
                pathname: "/Classroom/F/Test",
                query: {
                  classname: classname,
                  classcode: classcode,
                  subjectname: subjectname,
                },
              }}
              className="link-dark text-decoration-none"
            >
              <h4>TEST</h4>
            </Link>
            <a href="/Classroom/F/Students" className="link-dark ">
              <h4>STUDENTS</h4>
            </a>
          </div>

          <div className="justify-self-end ">
            <div className="d-flex justify-content-end">
              <input
                type="text"
                placeholder="Search by name"
                className="col-md-10 col-7 py-1 px-3 border border-dark rounded-start"
              />
              <a>
                <img
                  src="/search.svg"
                  alt="search"
                  height={37}
                  width={34}
                  className="border border-dark p-1 rounded-end"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Student List Table */}
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID NO.</th>
                <th>FIRST NAME</th>
                <th>MIDDLE NAME</th>
                <th>SURNAME</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {studlist[0]?.map((student, index) => (
                <>
                  <tr key={index}>
                    <td>{student.TUPCID}</td>
                    <td>{student.FIRSTNAME}</td>
                    <td>{student.MIDDLENAME}</td>
                    <td>{student.SURNAME}</td>
                    <td>{student.STATUS}</td>
                    <td className="text-center">
                      <button
                        className="btn-close"
                        data-bs-toggle="modal"
                        data-bs-target="#popup"
                      ></button>
                      <div
                        className="modal fade"
                        id="popup"
                        tabIndex="-1"
                        aria-labelledby="ModalLabel"
                        aria-hidden="true"
                        data-bs-backdrop="static"
                      >
                        <div className="modal-dialog modal-dialog-centered">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title" id="ModalLabel">
                                KICK STUDENT
                              </h5>
                              <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              ></button>
                            </div>
                            <div className="modal-body px-5">
                              SURE KANA?? (〃￣ω￣〃)ゞ
                            </div>
                            <div className="modal-footer align-self-center">
                              <button
                                type="button"
                                className="btn btn-outline-dark"
                                data-bs-dismiss="modal"
                                onClick={() => deleteStudents(student.TUPCID)}
                              >
                                CONFIRM
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>
        {/* End Student List Table */}
      </section>
    </main>
  );
}
