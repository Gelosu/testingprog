import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import bcryptjs from "bcryptjs";

export default function AdminPage() {
  // Refs for password fields
  const newPasswordRef = useRef(null);
  const newAdminEmailRef = useRef(null);
  const newAdminNameRef = useRef(null);
  const newStudentPasswordRef = useRef(null);
  const newAdminPasswordRef = useRef(null);
  const newFacultyPasswordRef = useRef(null);

  // State variables
  const [selectedOption, setSelectedOption] = useState("student");
  const [studentData, setStudentData] = useState([]);
  const [facultyData, setFacultyData] = useState([]);
  const [adminData, setAdminData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [originalStudentData, setOriginalStudentData] = useState([]);
  const [originalFacultyData, setOriginalFacultyData] = useState([]);
  const [originalAdminData, setOriginalAdminData] = useState([]);
  const [isStudentEditing, setIsStudentEditing] = useState(false);
  const [isFacultyEditing, setIsFacultyEditing] = useState(false);
  const [isAdminEditing, setIsAdminEditing] = useState(false);

  // Event handlers
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEditClick = (dataType) => {
    setIsEditing(true);

    if (dataType === "student") {
      setIsStudentEditing(true);
      setOriginalStudentData([...studentData]);
    } else if (dataType === "faculty") {
      setIsFacultyEditing(true);
      setOriginalFacultyData([...facultyData]);
    } else if (dataType === "admin") {
      setIsAdminEditing(true);
      setOriginalAdminData([...adminData]);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setIsStudentEditing(false);
    setIsFacultyEditing(false);
    setIsAdminEditing(false);
    setStudentData([...originalStudentData]);
    setFacultyData([...originalFacultyData]);
    setAdminData([...originalAdminData]);
  };

  // Update functions for student, faculty, and admin data
  // Function to update student data on the server
  const updateStudentDataOnServer = (TUPCID, updatedData) => {
    axios
      .put(`http://localhost:3001/student/${TUPCID}`, updatedData)
      .then((response) => {
        console.log(response.data);
        setIsEditing(false);
        setStudentData((prevData) =>
          prevData.map((student) =>
            student.TUPCID === TUPCID ? { ...student, ...updatedData } : student
          )
        );
      })
      .catch((error) => {
        console.error("Error updating student data:", error);
      });
  };

  const updateFacultyDataOnServer = (TUPCID, updatedData) => {
    axios
      .put(`http://localhost:3001/faculty/${TUPCID}`, updatedData)
      .then((response) => {
        console.log(response.data);
        setIsEditing(false);
        setFacultyData((prevData) =>
          prevData.map((faculty) =>
            faculty.TUPCID === TUPCID ? { ...faculty, ...updatedData } : faculty
          )
        );
      })
      .catch((error) => {
        console.error("Error updating faculty data:", error);
      });
  };

  // Function to update admin data on the server
  const updateAdminDataOnServer = (TUPCID, updatedData) => {
    axios
      .put(`http://localhost:3001/admin/${TUPCID}`, updatedData)
      .then((response) => {
        console.log(response.data);
        setIsEditing(false);
        setAdminData((prevData) =>
          prevData.map((admin) =>
            admin.TUPCID === TUPCID ? { ...admin, ...updatedData } : admin
          )
        );
      })
      .catch((error) => {
        console.error("Error updating admindata:", error);
      });
  };

  const handleUpdateSubmit = (TUPCID, dataType) => {
    const dataToUpdate =
      dataType === "student"
        ? studentData.find((student) => student.TUPCID === TUPCID)
        : dataType === "faculty"
        ? facultyData.find((faculty) => faculty.TUPCID === TUPCID)
        : adminData.find((admin) => admin.TUPCID === TUPCID);

    const newPassword = newPasswordRef.current?.value;

    let updatedData = {
      ...dataToUpdate,
      PASSWORD: newPassword || dataToUpdate.PASSWORD,
    };

    if (dataType === "student") {
      const newStudentPassword = newStudentPasswordRef.current?.value;
      if (newStudentPassword) {
        bcryptjs.hash(newStudentPassword, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing password:", err);
          } else {
            updatedData.STATUS = dataToUpdate.STATUS;
            updatedData.PASSWORD = hashedPassword;
            updateStudentDataOnServer(TUPCID, updatedData);
            setIsEditing(false);
            setIsStudentEditing(false);
          }
        });
      } else {
        updateStudentDataOnServer(TUPCID, updatedData);
        setIsEditing(false);
        setIsStudentEditing(false);
      }
    } else if (dataType === "faculty") {
      const newFacultyPassword = newFacultyPasswordRef.current?.value;
      if (newFacultyPassword) {
        bcryptjs.hash(newFacultyPassword, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing password:", err);
          } else {
            updatedData.PASSWORD = hashedPassword;
            updateFacultyDataOnServer(TUPCID, updatedData);
            setIsEditing(false);
            setIsFacultyEditing(false);
          }
        });
      } else {
        updateFacultyDataOnServer(TUPCID, updatedData);
        setIsEditing(false);
        setIsFacultyEditing(false);
      }
    } else if (dataType === "admin") {
      const newAdminPassword = newAdminPasswordRef.current?.value;
      if (newAdminPassword) {
        bcryptjs.hash(newAdminPassword, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing password:", err);
          } else {
            updatedData.PASSWORD = hashedPassword;
            updatedData.ADMINNAME = dataToUpdate.ADMINNAME;
            updatedData.EMAIL = dataToUpdate.EMAIL;
            updateAdminDataOnServer(TUPCID, updatedData);
            setIsEditing(false);
            setIsAdminEditing(false);
          }
        });
      } else {
        // No need to hash password again, just update name and email
        updatedData.ADMINNAME = newAdminNameRef.current?.value;
        updatedData.EMAIL = newAdminEmailRef.current?.value;
        updateAdminDataOnServer(TUPCID, updatedData);
        setIsEditing(false);
        setIsAdminEditing(false);
      }
    }
  };

  const handleDelete = (TUPCID, dataType) => {
    let endpoint;
    switch (dataType) {
      case "student":
        endpoint = "students";
        break;
      case "faculty":
        endpoint = "faculty";
        break;
      case "admin":
        endpoint = "admin";
        break;
      default:
        break;
    }

    axios
      .delete(`http://localhost:3001/${endpoint}/${TUPCID}`)
      .then((response) => {
        console.log(response.data);
        // Fetch data again after deletion
        fetchData();
      })
      .catch((error) => {
        console.error("Error deleting data:", error);
      });
  };

  const fetchData = () => {
    switch (selectedOption) {
      case "student":
        axios
          .get("http://localhost:3001/students")
          .then((response) => {
            setStudentData(response.data);
          })
          .catch((error) => {
            console.error("Error fetching student data:", error);
          });
        break;
      case "faculty":
        axios
          .get("http://localhost:3001/faculty")
          .then((response) => {
            setFacultyData(response.data);
          })
          .catch((error) => {
            console.error("Error fetching faculty data:", error);
          });
        break;
      case "admin":
        axios
          .get("http://localhost:3001/admin")
          .then((response) => {
            setAdminData(response.data);
          })
          .catch((error) => {
            console.error("Error fetching admin data:", error);
          });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedOption]);

  const filterData = (data, query) => {
    return data.filter((item) => {
      const fullName = `${item.FIRSTNAME}`.toLowerCase();
      return fullName.includes(query.toLowerCase());
    });
  };

  const handleSearch = () => {
    let filteredData;
    switch (selectedOption) {
      case "student":
        filteredData = filterData(studentData, searchQuery);
        setStudentData(filteredData);
        setSearchQuery("");
        fetchData();
        break;
      case "faculty":
        filteredData = filterData(facultyData, searchQuery);
        setFacultyData(filteredData);
        setSearchQuery("");
        fetchData();
        break;
      case "admin":
        filteredData = filterData(adminData, searchQuery);
        setAdminData(filteredData);
        setSearchQuery("");
        fetchData();
        break;
      default:
        break;
    }
  };

  const filteredStudentData = filterData(studentData, searchQuery);
  const filteredFacultyData = filterData(facultyData, searchQuery);
  const filteredAdminData = filterData(adminData, searchQuery);

  return (
    <main className="d-flex flex-column container-fluid py-3 pb-5">
      <h1 className="text-center">ADMIN PAGE</h1>
      <label htmlFor="databaseOption">DATABASE:</label>
      <div className="d-flex justify-content-between">
        <select
          className="col-3 rounded border border-dark py-1 px-3 text-center"
          id="databaseOption"
          value={selectedOption}
          onChange={handleOptionChange}
        >
          <option value="student">STUDENT DATABASE</option>
          <option value="faculty">FACULTY DATABASE</option>
          <option value="admin">ADMIN DATABASE</option>
        </select>
        <div className="d-flex">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name"
            className="py-1 px-3 border border-dark rounded-start"
          />
          <a onClick={handleSearch}>
            <img
              src="/search.svg"
              alt="search"
              height={34}
              width={34}
              className="border border-dark p-1 rounded-end"
            />
          </a>
        </div>
      </div>

      <div className="mt-2 border border-danger border-5 container-fluid p-1 rounded">
        {selectedOption === "student" && (
          <div className="container-fluid rounded w-100 bg-light">
            {/* Table Header */}
            <div className="row">
              <p className="m-0 col-1 border border-dark text-center rounded-start px-0">
                TUPCID
              </p>
              <p className="m-0 col-1 border border-dark text-center px-0">
                SURNAME
              </p>
              <p className="m-0 col-1 border border-dark text-center px-0">
                FIRSTNAME
              </p>
              <p className="m-0 col-3 border border-dark text-center px-0">
                GSFEACC
              </p>
              <p className="m-0 col-1 border border-dark text-center px-0">
                COURSE
              </p>
              <p className="m-0 col-1 border border-dark text-center px-0">
                YEAR
              </p>
              <p className="m-0 col-1 border border-dark text-center px-0">
                STATUS
              </p>
              <p className="m-0 col-2 border border-dark text-center px-0">
                PASSWORD
              </p>
              <p className="m-0 col-1 border border-dark text-center rounded-end">
                Action
              </p>
            </div>
            {/* Table Body */}
            {filteredStudentData.map((student) => (
              <div className="row" key={student.TUPCID}>
                <p className="m-0 col-1 border border-dark text-center">
                  {student.TUPCID}
                </p>
                <p className="m-0 col-1 border border-dark text-center">
                  {student.SURNAME}
                </p>
                <p className="m-0 col-1 border border-dark text-center">
                  {student.FIRSTNAME}
                </p>
                <p className="m-0 col-3 border border-dark text-center overflow-auto">
                  {student.GSFEACC}
                </p>
                <p className="m-0 col-1 border border-dark text-center">
                  {student.COURSE}
                </p>
                <p className="m-0 col-1 border border-dark text-center">
                  {isEditing && isStudentEditing ? (
                    <input
                      className="text-center py-1 px-3 border border-dark rounded col-12"
                      type="text"
                      value={student.YEAR}
                      onChange={(e) =>
                        setStudentData((prevData) =>
                          prevData.map((prevStudent) =>
                            prevStudent.TUPCID === student.TUPCID
                              ? { ...prevStudent, YEAR: e.target.value }
                              : prevStudent
                          )
                        )
                      }
                    />
                  ) : (
                    student.YEAR
                  )}
                </p>
                <p className="m-0 col-1 border border-dark text-center">
                  {isEditing && isStudentEditing ? (
                    <input
                      className="text-center py-1 px-3 border border-dark rounded col-12"
                      type="text"
                      value={student.STATUS}
                      onChange={(e) =>
                        setStudentData((prevData) =>
                          prevData.map((prevStudent) =>
                            prevStudent.TUPCID === student.TUPCID
                              ? { ...prevStudent, STATUS: e.target.value }
                              : prevStudent
                          )
                        )
                      }
                    />
                  ) : (
                    student.STATUS
                  )}
                </p>
                <p className="m-0 col-2 border border-dark text-center overflow-auto">
                  {isEditing && isStudentEditing ? (
                    <input
                      className="text-center py-1 px-3 border border-dark rounded col-12"
                      type="password"
                      value={student.PASSWORD}
                      onChange={(e) =>
                        setStudentData((prevData) =>
                          prevData.map((prevStudent) =>
                            prevStudent.TUPCID === student.TUPCID
                              ? { ...prevStudent, PASSWORD: e.target.value }
                              : prevStudent
                          )
                        )
                      }
                    />
                  ) : (
                    student.PASSWORD
                  )}
                </p>
                <p className="m-0 col-1 border border-dark text-center">
                  {isStudentEditing ? (
                    <div>
                      <a
                        onClick={() =>
                          handleUpdateSubmit(student.TUPCID, "student")
                        }
                        className="me-2"
                      >
                        <img
                          src="/update.svg"
                          alt="update"
                          height={20}
                          width={20}
                        />
                      </a>
                      <a onClick={handleCancelClick}>
                        <img
                          src="/cancel.svg"
                          alt="cancel"
                          height={20}
                          width={20}
                        />
                      </a>
                    </div>
                  ) : (
                    <a
                      onClick={() => handleEditClick("student")}
                      className="me-1"
                    >
                      <img src="/edit.svg" alt="edit" height={20} width={20} />
                    </a>
                  )}
                  <a onClick={() => handleDelete(student.TUPCID, "student")}>
                    <img
                      src="/delete.svg"
                      alt="delete"
                      height={20}
                      width={20}
                    />
                  </a>
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedOption === "faculty" && (
          <div className="container-fluid rounded w-100  bg-light">
            {/* Table Header */}

            <div className="row">
              <p className="col-1 m-0 border border-dark text-center custom-round1 px-0">
                TUPCID
              </p>
              <p className="col-1 m-0 border border-dark text-center px-0">
                SURNAME
              </p>
              <p className="col-1 m-0 border border-dark text-center px-0">
                FIRSTNAME
              </p>
              <p className="col-1 m-0 border border-dark text-center px-0 text-break">
                MIDDLENAME
              </p>
              <p className="col-3 m-0 border border-dark text-center">
                GSFEACC
              </p>
              <p className="col-1 m-0 border border-dark text-center px-0 text-break">
                SUBJECT DEPARTMENT
              </p>
              <p className="col-3 m-0 border border-dark text-center">
                PASSWORD
              </p>
              <p className="col-1 m-0 border border-dark text-center custom-round2">
                Action
              </p>
            </div>

            {/* Table Body */}

            {filteredFacultyData.map((faculty) => (
              <div className="row" key={faculty.TUPCID}>
                <p className="col-1 m-0 border border-dark text-center">
                  {faculty.TUPCID}
                </p>
                <p className="col-1 m-0 border border-dark text-center">
                  {faculty.SURNAME}
                </p>
                <p className="col-1 m-0 border border-dark text-center">
                  {faculty.FIRSTNAME}
                </p>
                <p className="col-1 m-0 border border-dark text-center">
                  {faculty.MIDDLENAME}
                </p>
                <p className="col-3 m-0 border border-dark text-center overflow-auto">
                  {faculty.GSFEACC}
                </p>
                <p className="col-1 m-0 border border-dark text-center">
                  {isEditing && isFacultyEditing ? (
                    <input
                      className="border border-dark rounded col-12 py-1 px-3 mt-1"
                      type="text"
                      value={faculty.SUBJECTDEPT}
                      onChange={(e) =>
                        setFacultyData((prevData) =>
                          prevData.map((prevFaculty) =>
                            prevFaculty.TUPCID === faculty.TUPCID
                              ? {
                                  ...prevFaculty,
                                  SUBJECTDEPT: e.target.value,
                                }
                              : prevFaculty
                          )
                        )
                      }
                    />
                  ) : (
                    faculty.SUBJECTDEPT
                  )}
                </p>
                <p className="col-3 m-0 border border-dark text-center overflow-auto">
                  {isEditing && isFacultyEditing ? (
                    <input
                      className="border border-dark rounded col-12 py-1 px-3 mt-1"
                      type="password"
                      defaultValue={faculty.PASSWORD}
                      ref={newFacultyPasswordRef}
                    />
                  ) : (
                    faculty.PASSWORD
                  )}
                </p>
                <p className="col-1 m-0 border border-dark text-center">
                  {isFacultyEditing ? (
                    <div>
                      <a
                        onClick={() =>
                          handleUpdateSubmit(faculty.TUPCID, "faculty")
                        }
                        className="me-2"
                      >
                        <img
                          src="/update.svg"
                          alt="update"
                          height={20}
                          width={20}
                        />
                      </a>
                      <a onClick={handleCancelClick}>
                        <img
                          src="/cancel.svg"
                          alt="cancel"
                          height={20}
                          width={20}
                        />
                      </a>
                    </div>
                  ) : (
                    <a
                      onClick={() => handleEditClick("faculty")}
                      className="me-1"
                    >
                      <img src="/edit.svg" alt="edit" height={20} width={20} />
                    </a>
                  )}
                  <a onClick={() => handleDelete(faculty.TUPCID, "faculty")}>
                    <img
                      src="/delete.svg"
                      alt="delete"
                      height={20}
                      width={20}
                    />
                  </a>
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedOption === "admin" && (
          <div className="container-fluid border border-danger rounded w-100  bg-light">
            {/* Table Header */}

            <div className="row">
              <p className="col-2 m-0 border border-dark text-center">TUPCID</p>
              <p className="col-2 m-0 border border-dark text-center">
                ADMINNAME
              </p>
              <p className="col-4 m-0 border border-dark text-center">EMAIL</p>
              <p className="col-3 m-0 border border-dark text-center">
                PASSWORD
              </p>
              <p className="col-1 m-0 border border-dark text-center">Action</p>
            </div>

            {/* Table Body */}

            {filteredAdminData.map((admin) => (
              <div className="row" key={admin.TUPCID}>
                <p className="col-2 m-0 border border-dark text-center">
                  {admin.TUPCID}
                </p>
                <p className="col-2 m-0 border border-dark text-center">
                  {isEditing && isAdminEditing ? (
                    <input
                      className="py-1 px-3 col-12 rounded border border-dark mt-1"
                      type="text"
                      value={admin.ADMINNAME}
                      onChange={(e) =>
                        setAdminData((prevData) =>
                          prevData.map((prevAdmin) =>
                            prevAdmin.TUPCID === admin.TUPCID
                              ? { ...prevAdmin, ADMINNAME: e.target.value }
                              : prevAdmin
                          )
                        )
                      }
                    />
                  ) : (
                    admin.ADMINNAME
                  )}
                </p>
                <p className="col-4 m-0 border border-dark text-center">
                  {isEditing && isAdminEditing ? (
                    <input
                      className="py-1 px-3 col-12 rounded border border-dark mt-1"
                      type="text"
                      value={admin.EMAIL}
                      onChange={(e) =>
                        setAdminData((prevData) =>
                          prevData.map((prevAdmin) =>
                            prevAdmin.TUPCID === admin.TUPCID
                              ? { ...prevAdmin, EMAIL: e.target.value }
                              : prevAdmin
                          )
                        )
                      }
                    />
                  ) : (
                    admin.EMAIL
                  )}
                </p>
                <p className="col-3 m-0 border border-dark text-center overflow-auto">
                  {isEditing && isAdminEditing ? (
                    <input
                      className="py-1 px-3 col-12 rounded border border-dark mt-1"
                      type="password"
                      defaultValue={admin.PASSWORD}
                      ref={newAdminPasswordRef}
                    />
                  ) : (
                    admin.PASSWORD
                  )}
                </p>
                <p className="col-1 m-0 border border-dark text-center">
                  {isAdminEditing ? (
                    <div>
                      <a
                        onClick={() =>
                          handleUpdateSubmit(admin.TUPCID, "admin")
                        }
                        className="me-2"
                      >
                        <img
                          src="/update.svg"
                          alt="update"
                          height={20}
                          width={20}
                        />
                      </a>
                      <a onClick={handleCancelClick}>
                        <img
                          src="/cancel.svg"
                          alt="cancel"
                          height={20}
                          width={20}
                        />
                      </a>
                    </div>
                  ) : (
                    <a
                      onClick={() => handleEditClick("admin")}
                      className="me-1"
                    >
                      <img src="/edit.svg" alt="edit" height={20} width={20} />
                    </a>
                  )}
                  <a onClick={() => handleDelete(admin.TUPCID, "admin")}>
                    <img
                      src="/delete.svg"
                      alt="delete"
                      height={20}
                      width={20}
                    />
                  </a>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
