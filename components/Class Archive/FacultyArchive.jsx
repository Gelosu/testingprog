"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useTupcid } from "@/app/provider";

export default function FacultyArchive() {
  const [classes, setClasses] = useState([]);
  const [cCode, setClassCode] = useState("");
  const [cName, setcName] = useState("");
  const [sName, setsName] = useState("");
  const { tupcids } = useTupcid();
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [classCodeExists, setClassCodeExists] = useState(false);

  useEffect(() => {
    fetchAndSetClasses();
    const interval = setInterval(fetchAndSetClasses, 1000);
    return () => clearInterval(interval);
  }, [tupcids]);

  const fetchAndSetClasses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/classes/${tupcids}`
      );
      if (response.status === 200) {
        setClasses(response.data);
      } else {
        console.error("Error fetching classes");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };


  const clearInputs = () => {
    setClassCode("");
    setcName("");
    setsName("");
    setErrorMessage("");
    setClassCodeExists(false);
  };

  
  const checkClassCodeExists = async (classCode) => {
    try {
      console.log("classcode checking:",classCode)
      const response = await axios.get(`http://localhost:3001/checkclass/${classCode}`);
      return response.status === 200 && response.data.exists;
     
    } catch (error) {
      console.error("Error checking class code:", error);
      return false; // Default to not existing in case of an error
    }
  };
  
  const isEnterButtonDisabled = errorMessage || classCodeExists || classes.some(
    (classItem) =>
      classItem.class_code === cCode.trim() ||
      (classItem.class_name === cName.trim() && classItem.subject_name === sName.trim())
  );
  

  


  const fetchClasses = async () => {
    await fetchAndSetClasses();
  };

  const addClass = async () => {
    if (cCode.trim() !== "" && cName.trim() !== "" && sName.trim() !== "") {
      // Check if the entered class code already exists
      const classCodeExists = await checkClassCodeExists(cCode.trim());
  
      if (classCodeExists) {
        console.log("Class code already exists. Cannot add class.");
        setClassCodeExists(true); // Set the state to disable the button
        return;
      }
  
      const newClass = {
        class_code: cCode,
        class_name: cName,
        subject_name: sName,
        TUPCID: tupcids,
      };
  
      try {
        const response = await axios.post(
          "http://localhost:3001/addclass",
          newClass
        );
  
        console.log("response: ", response);
  
        if (response.status === 200) {
          fetchClasses();
          setClassCode("");
          setcName("");
          setsName("");
          setErrorMessage("");
          setClassCodeExists(false); // Reset the state to enable the button
        } else {
          console.error("Error adding class");
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          setErrorMessage("Class Already Exists");
        } else {
          setErrorMessage("");
        }
      }
    }
  };
  
  
  // deleteclass
  const deleteClass = async (tupcids,class_name) => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/deleteclass/${tupcids}/${class_name}`
      );
      if (response.status === 200) {
        console.log("Class deleted successfully");
        fetchClasses(); // Fetch updated class list
      } else {
        console.error("Error deleting class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };



  return (
    <main className="custom-m col-11 col-md-10 p-0 vh-100">
      <section className="container-fluid p-sm-4 py-3 ">
        <h3>FACULTY</h3>
        <button
          type="button"
          className="btn btn-outline-dark pe-3"
          data-bs-toggle="modal"
          data-bs-target="#popup"
          onClick={() => {
            clearInputs();
            setShowModal(true);
          }}
        >
          <Image
            className="pb-1"
            src="/add.svg"
            alt="add"
            height={25}
            width={20}
          />
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
                  CLASSROOM
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={clearInputs}
                ></button>
              </div>
              <div className="modal-body px-5">
                <p className="text-center mb-1 ">CLASS NAME</p>
                <input
                  value={cName}
                  type="text"
                  className="py-1 px-3 border border-dark w-100 rounded text-center"
                  onChange={(e) => setcName(e.target.value)}
                />
                <p className="text-center mb-1 mt-3">CLASS CODE</p>
                <input
  type="text"
  className="py-1 px-3 border border-dark w-100 rounded text-center"
  value={cCode}
  onChange={async (e) => {
    const inputClassCode = e.target.value.trim();
    setClassCode(inputClassCode);

    // Check if the entered class code already exists
    const codeExists = await checkClassCodeExists(inputClassCode);
    setClassCodeExists(codeExists);
  }}
/>

                <p className="text-center mb-1 mt-3">SUBJECT NAME</p>
                <input
                  value={sName}
                  type="text"
                  className="py-1 px-3 border border-dark w-100 rounded text-center"
                  onChange={(e) => setsName(e.target.value)}
                />
                <p className="text-center text-danger">{errorMessage}</p>
              </div>
              <div className="modal-footer align-self-center">
              {isEnterButtonDisabled &&  (
                  <p className="text-danger mt-2">
                    Class code or same subject name in the given class already exists. Please enter a unique code or subject name.
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={() => {
                    if (!isEnterButtonDisabled && !classCodeExists) {
                      addClass();
                      clearInputs();
                      setShowModal(false); // Close modal
                    }
                  }}
                  disabled={isEnterButtonDisabled || classCodeExists}
                  data-bs-dismiss="modal"
                  
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
          {classes.map((data, index) => (
            <section
              key={index}
              className="col-lg-3 col-md-5 col-12 border border-dark rounded mb-3 me-3 p-5 text-decoration-none link-dark"
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
                      onClick={() => deleteClass(data.TUPCID,data.class_name)}
                    >
                      Remove Class
                    </a>
                  </li>
                </ul>
              </div>
              <Link
                key={index}
                href={{
                  pathname: "/Classroom/F/Test",
                  query: {
                    classname: data.class_name,
                    subjectname: data.subject_name,
                    classcode: data.class_code,
                  },
                }}
                className="link-dark text-decoration-none"
              >
                <p className="text-center">{data.class_name} {data.subject_name}</p>
             
              </Link>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}