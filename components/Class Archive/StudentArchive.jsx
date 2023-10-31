import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useTupcid } from "@/app/provider";
import Link from "next/link";

export default function StudentArchive() {
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState("");
  const [userClasses, setUserClasses] = useState([]);
  const { tupcids } = useTupcid();

  useEffect(() => {
    const fetchClassesInterval = setInterval(() => {
      fetchUserClasses(tupcids).then((classes) => {
        setUserClasses(classes);
      });
    }, 1000); // Fetch classes every 1000 milliseconds (1 second)

    return () => {
      clearInterval(fetchClassesInterval); // Clean up the interval on unmount
    };
  }, [tupcids]);

  const fetchUserClasses = async (tupcid) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/getclasses/${tupcid}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user classes:", error);
      return [];
    }
  };

  const addClass = async () => {
    if (inputValue.trim() !== "") {
      try {
        const response = await axios.get(
          `http://localhost:3001/checkclass/${inputValue}`
        );
        if (response.data.exists) {
          // Fetch subject name based on class code
          const subjectResponse = await axios.get(
            `http://localhost:3001/getsubjectname/${inputValue}`
          );
          if (subjectResponse.status === 200) {
            const subjectName = subjectResponse.data.subject_name;

            // Send a POST request to add the class to studentclass_table
            const addClassResponse = await axios.post(
              "http://localhost:3001/addclassstud",
              {
                TUPCID: tupcids, 
                class_code: inputValue,
                subject_name: subjectName,
              }
            );

            if (addClassResponse.status === 201) {
              setClassCode((prevClassCode) => [
                ...prevClassCode,
                {
                  class_code: inputValue,
                  subject_name: subjectName,
                },
              ]);
              setInputValue("");
              setMessage("");
            } else {
              console.error("Error adding class");
              setMessage("Error adding class");
            }
          } else {
            console.error("Error fetching subject name");
            setMessage("Error fetching subject name");
          }
        } else {
          setMessage("Class code not found.");
        }
      } catch (error) {
        console.log("Error checking class code:", error);
        if (error.response && error.response.data) {
          console.log("Server response:", error.response.data);
        }
        setMessage("An error occurred while checking the class code.");
      }
    }
  };

  const deleteEnrollment = async (TUPCID, subjectName) => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/deletestudentenrollment/${TUPCID}/${subjectName}`
      );
      if (response.status === 200) {
        console.log("Enrollment deleted successfully");

        // Update the userClasses state after deleting enrollment
        const updatedUserClasses = userClasses.filter(
          (classData) =>
            classData.TUPCID !== TUPCID ||
            classData.subject_name !== subjectName
        );
        setUserClasses(updatedUserClasses);
      } else {
        console.error("Error deleting enrollment");
      }
    } catch (error) {
      console.error("Error deleting enrollment:", error);
    }
  };

  return (
    <main className="custom-m col-11 col-md-10 p-0 vh-100">
      <section className="container-fluid p-sm-4 py-3 ">
        <h3>STUDENT</h3>
        <button
          type="button"
          className="btn btn-outline-dark pe-3"
          data-bs-toggle="modal"
          data-bs-target="#popup"
        >
          <Image className="pb-1" src="/add.svg" alt="add" height={25} width={20}></Image>
          <span>NEW</span>
        </button>
        {/* MODAL */}
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
                  INSERT SUBJECT CODE
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  value={inputValue}
                  className="py-1 px-3 border border-dark w-100 rounded"
                  placeholder="Ask class code to your professor"
                  onChange={(e) => {
                    setInputValue(e.target.value);
                  }}
                />
              </div>
              <div className="modal-footer align-self-center">
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  data-bs-dismiss="modal"
                  onClick={addClass}
                >
                  Enter
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* End MODAL */}
        {/* Start */}
        <div className="d-flex flex-wrap flex-start pt-2 ">
          {userClasses.map((classData, index) => (
            <section
              className="col-lg-3 col-md-5 col-12 border border-dark rounded mb-3 me-3 p-5 text-decoration-none link-dark"
              key={index}
            >
              <div className="text-end">
                <Image
                  src="/three-dots.svg"
                  alt="menu"
                  width={20}
                  height={20}
                  role="button"
                  id="dropdownMenuLink"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                />
                <ul
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuLink"
                >
                  <li>
                    <a
                      className="dropdown-item"
                      onClick={() =>
                        deleteEnrollment(
                          classData.TUPCID,
                          classData.subject_name
                        )
                      }
                      key={index}
                    >
                      Remove Class
                    </a>
                  </li>
                </ul>
              </div>
              <Link
                key={index}
                href={{
                  pathname: "/Classroom/S/Result",
                  query: {
                    subjectname: classData.subject_name,
                    classcode: classData.class_code,
                  },
                }}
                className="link-dark text-decoration-none"
              >
                <p className="text-center">{classData.subject_name}</p>
              </Link>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}