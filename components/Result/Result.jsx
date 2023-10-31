"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useSearchParams } from "next/navigation";

export default function Result() {
  const searchParams = useSearchParams();
  const subjectname = searchParams.get("subjectname");
  const classcode = searchParams.get("classcode");
  const [professorname, setProfessorname] = useState("");
  const [tests, setTests] = useState([]); // Store test data here

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getProfTUPCID/${subjectname}/${classcode}`
        );
        const TUPCID = response.data.TUPCID;
        if (response) {
          const professorResponse = await axios.get(
            `http://localhost:3001/getProfName/${TUPCID}`
          );
          const { FIRSTNAME, MIDDLENAME, SURNAME } = professorResponse.data;
          setProfessorname(`${FIRSTNAME} ${MIDDLENAME} ${SURNAME}`);
          // Waiting for the test part in index.js
          // const testsResponse = await axios.get(
          //   `http://localhost:3001/getTests/${subjectname}/${classcode}`
          // );
          // setTests(testsResponse.data.tests);
        } else {
          console.log("No data");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTestResults();
  }, [subjectname, classcode]);

  return (
    <main className="custom-m col-11 col-md-10 p-0">
      <section className="container-fluid p-sm-4 py-3 ">
        <div className="d-flex align-items-center">
          <Link href="/Classroom/S">
            <img src="/back-arrow.svg" height={30} width={40} />
          </Link>
        </div>
        <div className="container-sm">
          <div>
            <p>Subject: {subjectname}</p>
            <p>Class Code: {classcode}</p>
            <p>Professor Name: {professorname}</p>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>TEST NO.</th>
                  <th>NO. OF CORRECT</th>
                  <th>WRONG QUESTIONS</th>
                  <th>TOTAL SCORE</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test, index) => (
                  <tr key={index}>
                    <td>{test.testNumber}</td>
                    <td>{test.numCorrect}</td>
                    <td>{test.numWrong}</td>
                    <td>{test.totalScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}