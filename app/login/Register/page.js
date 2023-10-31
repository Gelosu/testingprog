"use client";
import Footer from "@/components/DefaultFix/Footer";
import NavBar from "@/components/DefaultFix/NavBar";
import FacultyRegister from "@/components/LoginPage/FacultyRegister";
import PositionOPT from "@/components/LoginPage/PositionOPT";
import StudentRegister from "@/components/LoginPage/StudentRegister";
import { useState } from "react";

export default function RegisterPage() {
  const [facultybtn, setFacultybtn] = useState(false);
  const [studentbtn, setStudentbtn] = useState(false);
  const StudentClick = () => {
    setStudentbtn(!studentbtn);
  };
  const FacultyClick = () => {
    setFacultybtn(!facultybtn);
  };

  return (
    <main>
      <div>
        <NavBar />
      </div>

      <div>
        {studentbtn ? (
          <StudentRegister />
        ) : facultybtn ? (
          <FacultyRegister />
        ) : (
          <PositionOPT SClick={StudentClick} FClick={FacultyClick} />
        )}
      </div>
      <div>
        <Footer />
      </div>
    </main>
  );
}
