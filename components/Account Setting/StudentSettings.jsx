import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useTupcid } from "@/app/provider";

export default function StudentSetting() {
  const { tupcids } = useTupcid();
  const searchParams = useSearchParams();
  const TUPCID = searchParams.get("TUPCID");
  const [firstName, setFirstName] = useState("");
  const [surName, setSurName] = useState("");
  const [MiddleName, setMiddleName] = useState("");
  const [course, setCourse] = useState("");
  const [section, setSection] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [gsfeacc, setGsfeacc] = useState("");
  const [initialStudentInfo, setInitialInfo] = useState({});
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    const fetchstudentdate = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/studinfos/${TUPCID || tupcids}`
        );
        const {
          FIRSTNAME,
          SURNAME,
          MIDDLENAME,
          COURSE,
          SECTION,
          YEAR,
          STATUS,
          GSFEACC,
          
        } = response.data;

        // Store initial faculty information
        const initialStudentInfo = {
          FIRSTNAME,
          MIDDLENAME,
          SURNAME,
          COURSE,
          SECTION,
          YEAR,
          STATUS,
          GSFEACC,
        };

        // Set state with fetched data
        setFirstName(FIRSTNAME);
        setMiddleName(MIDDLENAME);
        setSurName(SURNAME);
        setCourse(COURSE);
        setSection(SECTION);
        setYear(YEAR);
        setStatus(STATUS);
        setGsfeacc(GSFEACC);
       
        setInitialInfo(initialStudentInfo);
      } catch(error){
        console.log(error)
      }
    };
    fetchstudentdate();
  }, [TUPCID, tupcids]);

  const handleSave = async () => {
    try {
      const updatedData = {
        FIRSTNAME: firstName,
        SURNAME: surName,
        MIDDLENAME: MiddleName,
        COURSE: course,
        SECTION: section,
        YEAR: year,
        STATUS: status,
        GSFEACC: gsfeacc,
      };

      await updateStudentDataOnServer(TUPCID, updatedData);
       // Update initial faculty information
       setInitialInfo(updatedData);
       // Update shared state or context with the new information
       updateStudentInfoContext(updatedData);
       // Exit editing mode
       setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStudentDataOnServer = async (TUPCID, updatedData) => {
    try {
      await axios.put(
        `http://localhost:3001/updatestudentinfos/${TUPCID}`,
        updatedData
      );
    } catch (error) {
      console.error("Error updating student data:", error);
    }
  };

  return (
    <main className="custom-m col-11 col-md-10 p-0">
      <section className="container-fluid p-sm-4 py-3 ">
        <div className="d-flex align-items-center">
          <Link href="http://localhost:3000/Classroom/S">
            <img src="/back-arrow.svg" height={30} width={40} />
          </Link>
          <h2 className="m-0">Settings</h2>
        </div>
        <h3 className="text-center pt-3 m-0 ">UPDATE PERSONAL INFO</h3>
        <div className="d-flex justify-content-center flex-column container col-md-10 col-lg-7 rounded border border-dark bg-lightgray">
        <button
              className="btn btn-secondary col-md-1 col-lg-1 border border-dark rounded"
              onClick={() => {
                if (isEditing) {
                  setFirstName(initialStudentInfo.FIRSTNAME);
                  setMiddleName(initialStudentInfo.MIDDLENAME);
                  setSurName(initialStudentInfo.SURNAME);
                  setCourse(initialStudentInfo.COURSE);
                  setSection(initialStudentInfo.SECTION);
                  setYear(initialStudentInfo.YEAR);
                  setStatus(initialStudentInfo.STATUS);
                  setGsfeacc(initialStudentInfo.GSFEACC);
                }
                setIsEditing((prevEditing) => !prevEditing);
              }}
            >
              {isEditing ? "X" : "EDIT"}
            </button>
          <form
            onSubmit={handleSave}
            className="row p-3 pt-0 col-sm-10 text-sm-start text-center align-self-center"
          >
            <div className="col-sm-6 p-2">
              <p className="p-0 m-0">TUPC ID</p>
              <input
                type="text"
                value={TUPCID || tupcids}
                className="col-12 rounded py-1 px-3 border border-dark bg-secondary"
                readOnly
              />
            </div>
            <div className="col-sm-6 p-2">
              <p className="p-0 m-0">GSFE ACCOUNT</p>
              <input
                type="text"
                value={gsfeacc}
                className="col-12 rounded py-1 px-3 border border-dark"
                disabled={!isEditing}
                onChange={(e) => setGsfeacc(e.target.value)}
              />
            </div>
            <div className="col-sm-6 p-2">
              <p className="p-0 m-0">FIRST NAME</p>
              <input
                type="text"
                value={firstName}
                className="col-12 rounded py-1 px-3 border border-dark"
                disabled={!isEditing}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="col-sm-6 p-2">
              <p className="p-0 m-0">COURSE</p>
              <select
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="col-12 rounded py-1 px-3 border border-dark"
                disabled={!isEditing}
              >
                <option value="none" disabled hidden>
                  Choose...
                </option>
                <option value="BSCE">BSCE</option>
                <option value="BSEE">BSEE</option>
                <option value="BSME">BSME</option>
                <option value="BSIE ICT">BSIE ICT</option>
                <option value="BSIE IA">BSIE IA</option>
                <option value="BSIE HE">BSIE HE</option>
                <option value="BTTE CP">BTTE CP</option>
                <option value="BTTE EL">BTTE EL</option>
                <option value="BET AT">BET AT</option>
                <option value="BET CT">BET CT</option>
                <option value="BET COET">BET COET</option>
                <option value="BET ET">BET ET</option>
                <option value="BET ESET">BET ESET</option>
                <option value="BET MT">BET MT</option>
                <option value="BET PPT">BET PPT</option>
              </select>
            </div>
            <div className="col-sm-6 p-2">
              <p className="p-0 m-0">MIDDLE NAME</p>
              <input
                type="text"
                value={MiddleName}
                className="col-12 rounded py-1 px-3 border border-dark"
                disabled={!isEditing}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </div>
            <div className="col-sm-6 p-2">
              <p className="p-0 m-0">YEAR</p>
              <select
                type="text"
                value={year}
                className="col-12 rounded py-1 px-3 border border-dark"
                onChange={(e) => setYear(e.target.value)}
                disabled={!isEditing}
              >
                <option value="none" disabled hidden>
                  Choose...
                </option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
              </select>
            </div>
            <div className="col-sm-6 p-2">
              <p className="p-0 m-0">SURNAME</p>
              <input
                type="text"
                value={surName}
                className="col-12 rounded py-1 px-3 border border-dark"
                disabled={!isEditing}
                onChange={(e) => setSurName(e.target.value)}
              />
            </div>
            <div className="col-sm-6 p-2">
              <p className="p-0 m-0">SECTION</p>
              <select
                type="text"
                value={section}
                className="col-12 rounded py-1 px-3 border border-dark"
                onChange={(e) => setSection(e.target.value)}
                disabled={!isEditing}
              >
                <option value="none" disabled hidden>
                  Choose...
                </option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>
            <div className="col-sm-6 p-2">
              <p className="p-0 m-0">STATUS</p>
              <select
                type="text"
                value={status}
                className="col-12 rounded py-1 px-3 border border-dark"
                disabled={!isEditing}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="none" selected hidden disabled>
                  Choose...
                </option>
                <option value="Regular">Regular</option>
                <option value="Irregular">Irregular</option>
              </select>
            </div>
            <div className="col-sm-6 p-2">
            <p className="col-sm-6 p-0 m-0 align-self-center">
                PASSWORD: 
                <Link href="/login/ForgetPassword">Update Password</Link>
              </p>
            </div>
            {isEditing && (
              <div className="pt-3 text-center col-12">
                <button
                  type="submit"
                  className="btn btn-light col-md-5 col-lg-2 border border-dark rounded text-center"
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