"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTupcid } from "@/app/provider";

export default function FacultyAside() {
  var { tupcids } = useTupcid();
  const [facultyInfos, setFacultyInfos] = useState([]);
  const [navs, setNavs] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/facultyinfo/${tupcids}`
        );
        const { FIRSTNAME, SURNAME, SUBJECTDEPT, GSFEACC } = response.data;
        setFacultyInfos({
          FirstName: FIRSTNAME,
          SurName: SURNAME,
          SubjDept: SUBJECTDEPT,
          GsfeAcc: GSFEACC,
        });
      } catch (error) {
        console.log("Error fetching FACULTY data:", error);
      }
    };
    fetchData();
  }, [tupcids]);

  const animate = () => {
    setNavs(!navs);
  };
  return (
    <aside
      className={
        navs
          ? "custom-con2 w-50 px-0 bg-danger"
          : "custom-con1 col-1 col-md-2 px-sm-2 px-0 bg-danger"
      }
    >
      <div className="d-flex flex-column align-items-center justify-content-between pt-2 text-white custom-h3 vh-100">
        <div
          className={
            navs
              ? "custom-hov2 flex-column text-center"
              : "custom-hov1 d-md-flex flex-column text-center"
          }
        >
          <div className="Circle2 align-self-center"></div>
          <p className="my-2">{tupcids}</p>
          <p className="my-2">
            {facultyInfos.SurName}, {facultyInfos.FirstName}
          </p>
          <small>{facultyInfos.SubjDept}</small>
        </div>
        <input
          type="checkbox"
          className={navs ? "custom-c" : "custom-v"}
          onClick={animate}
        />
        <div
          className={
            navs
              ? "custom-hov2 flex-column align-self-start px-2"
              : "custom-hov1 d-md-flex flex-column align-self-start px-2"
          }
        >
          <Link
            href={{
              pathname: "/Classroom/F/Setting",
              query: { TUPCID: tupcids },
            }}
            className="text-decoration-none link-light"
          >
            <p className="my-2">SETTINGS</p>
          </Link>
          <Link
            href={{
              pathname: "/Classroom/F/ReportProblem",
              query: { gmail: facultyInfos.GsfeAcc },
            }}
            className="text-decoration-none link-light"
          >
            <p className="my-2">REPORT PROBLEM</p>
          </Link>

          <Link href="/login" className="text-decoration-none link-light">
            <p className="fw-100 my-2">LOGOUT</p>
          </Link>
        </div>
      </div>
    </aside>
  );
}
