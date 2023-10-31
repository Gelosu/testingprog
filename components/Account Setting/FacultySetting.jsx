import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useTupcid } from "@/app/provider";

export default function FacultySetting() {
  const { tupcids } = useTupcid();
  const searchParams = useSearchParams();
  const TUPCID = searchParams.get("TUPCID");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surName, setSurName] = useState("");
  const [gsfeacc, setGsfeacc] = useState("");
  const [subjectdept, setSubjectdept] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [initialFacultyInfo, setInitialInfo] = useState({});

  useEffect(() => {
    const fetchFacultyInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/facultyinfos/${TUPCID || tupcids}`
        );
        const {
          FIRSTNAME,
          MIDDLENAME,
          SURNAME,
          GSFEACC,
          SUBJECTDEPT,
        } = response.data;

        // Store initial faculty information
        const initialFacultyInfo = {
          FIRSTNAME,
          MIDDLENAME,
          SURNAME,
          GSFEACC,
          SUBJECTDEPT,
        };

        // Set state with fetched data
        setFirstName(FIRSTNAME);
        setMiddleName(MIDDLENAME);
        setSurName(SURNAME);
        setGsfeacc(GSFEACC);
        setSubjectdept(SUBJECTDEPT);

        // Set initial faculty information
        setInitialInfo(initialFacultyInfo);
      } catch (error) {
        console.log(error);
      }
    };

    // Call the function to fetch data
    fetchFacultyInfo();
  }, [TUPCID, tupcids]);

  const handleSave = async () => {
    try {
      const updatedData = {
        FIRSTNAME: firstName,
        MIDDLENAME: middleName,
        SURNAME: surName,
        GSFEACC: gsfeacc,
        SUBJECTDEPT: subjectdept,
      };
     
      await updateFacultyDataOnServer(TUPCID || tupcids, updatedData);
      window.location.reload();
      // Update initial faculty information
      setInitialInfo(updatedData);
      // Update shared state or context with the new information
      updateFacultyInfoContext(updatedData);
      // Exit editing mode
      setIsEditing(false);
      
    } catch (error) {
      console.log(error);
    }
  };
  

  const updateFacultyDataOnServer = async (TUPCID, updatedData) => {
    try {
      await axios.put(
        `http://localhost:3001/updatefacultyinfos/${TUPCID}`,
        updatedData
      );
      // Update state with new values
      setFirstName(updatedData.FIRSTNAME);
      setMiddleName(updatedData.MIDDLENAME);
      setSurName(updatedData.SURNAME);
      setGsfeacc(updatedData.GSFEACC);
      setSubjectdept(updatedData.SUBJECTDEPT);
      // Password is not updated here since it might be hashed
    } catch (error) {
      console.error("Error updating faculty data:", error);
    }
  };

  return (
    <main className="custom-m col-11 col-md-10 p-0">
      <section className="container-fluid p-sm-4 py-3 ">
        <div className="d-flex align-items-center">
          <Link href="http://localhost:3000/Classroom/F">
            <img src="/back-arrow.svg" height={30} width={40} />
          </Link>
          <h2 className="m-0">Settings</h2>
        </div>
        <h3 className="text-center pt-3 m-0 ">UPDATE PERSONAL INFO</h3>
        <div className="d-flex justify-content-center flex-column container col-md-10 col-lg-7 rounded border border-dark bg-lightgray">
          <div className="text-end pt-2">
            <button
              className="btn btn-secondary col-md-1 col-lg-1 border border-dark rounded"
              onClick={() => {
                if (isEditing) {
                  setFirstName(initialFacultyInfo.FIRSTNAME);
                  setMiddleName(initialFacultyInfo.MIDDLENAME);
                  setSurName(initialFacultyInfo.SURNAME);
                  setGsfeacc(initialFacultyInfo.GSFEACC);
                  setSubjectdept(initialFacultyInfo.SUBJECTDEPT);
                }
                setIsEditing((prevEditing) => !prevEditing);
              }}
            >
              {isEditing ? "X" : "EDIT"}
            </button>
          </div>

          <form
            className="p-3 pt-0 col-sm-10 text-sm-start text-center align-self-center"
            onSubmit={handleSave}
          >
            <div className="row p-3 pt-1 pb-2">
              <p className="col-sm-6 p-0 m-0 align-self-center">TUPC ID</p>
              <input
                type="text"
                value={TUPCID || tupcids}
                className="col-sm-6 rounded py-1 px-3 border border-dark bg-secondary"
                readOnly
              />
            </div>
            <div className="row p-3 pt-1 pb-2">
              <p className="col-sm-6 p-0 m-0 align-self-center">FIRST NAME</p>
              <input
                type="text"
                value={firstName}
                className="col-sm-6 rounded py-1 px-3 border border-dark"
                disabled={!isEditing}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="row p-3 pt-1 pb-2">
              <p className="col-sm-6 p-0 m-0 align-self-center">MIDDLE NAME</p>
              <input
                type="text"
                value={middleName}
                className="col-sm-6 rounded py-1 px-3 border border-dark"
                disabled={!isEditing}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </div>
            <div className="row p-3 pt-1 pb-2">
              <p className="col-sm-6 p-0 m-0 align-self-center">SURNAME</p>
              <input
                type="text"
                value={surName}
                className="col-sm-6 rounded py-1 px-3 border border-dark"
                disabled={!isEditing}
                onChange={(e) => setSurName(e.target.value)}
              />
            </div>
            <div className="row p-3 pt-1 pb-2">
              <p className="col-sm-6 p-0 m-0 align-self-center">GSFE ACCOUNT</p>
              <input
                type="text"
                value={gsfeacc}
                className="col-sm-6 rounded py-1 px-3 border border-dark"
                disabled={!isEditing}
                onChange={(e) => setGsfeacc(e.target.value)}
              />
            </div>
            <div className="row p-3 pt-1 pb-2">
              <p className="col-sm-6 p-0 m-0 align-self-center">
                SUBJECT DEPARTMENT
              </p>
              <select
                type="text"
                value={subjectdept}
                className="col-sm-6 rounded py-1 px-3 border border-dark"
                disabled={!isEditing}
                onChange={(e) => setSubjectdept(e.target.value)}
              >
                <option value="none" disabled hidden>
                  Choose...
                </option>
                <option value="DIT">Department of Industrial Technology</option>
                <option value="DED">Department of Industrial Education</option>
                <option value="DES">Department of Engineering Sciences</option>
                <option value="DLA">Department of Liberal Arts</option>
                <option value="DMS">Department of Mathematics and Sciences</option>
              </select>
            </div>
            <div className="row p-3 pt-1 pb-2">
              <p className="col-sm-6 p-0 m-0 align-self-center">
                PASSWORD: 
                <Link href="/login/ForgetPassword">Update Password</Link>
              </p>
            </div>
            {isEditing && (
              <div className="pt-3 text-center col-12">
                <button
                  type="button"
                  className="btn btn-light col-md-5 col-lg-2 border border-dark rounded text-center"
                  onClick={() => {
                    handleSave();
                    // Optionally, you can reset the form to a non-editing state here
                    setIsEditing(false);
                  }}
                >
                  SAVE
                </button>
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}