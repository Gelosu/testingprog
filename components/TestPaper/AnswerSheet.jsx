"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useTupcid } from '@/app/provider';
import Link from "next/link";

export default function AnswerSheet() {
  const { tupcids } = useTupcid();
  const [testType, setTestType] = useState('Create Test Paper First....');
  const [testData, setTestData] = useState([]);

  const searchparams = useSearchParams();
  const testnumber = searchparams.get("testnumber");
  const testname = searchparams.get("testname");
  const classname = searchparams.get("classname");
  const subjectname = searchparams.get("subjectname");
  const classcode = searchparams.get("classcode");
  const uid = searchparams.get("uid");



  const generateAnswerSheet = async () => {
    try {
      // Send a GET request to your endpoint
      const response = await fetch(`http://localhost:3001/generateAnswerSheet/${uid}/${classcode}`);
      console.log("uid...", uid)
      console.log("classcode...", classcode)
  
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${testname}_answersheet.pdf`;
        a.click();
      } else { 
        console.error("Failed to generate PDF.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };


  const handleGenerateAnswerSheet = () => {
    generateAnswerSheet();
  };
  

  const fetchQtypeandQn = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/getquestionstypeandnumber/${tupcids}/${uid}`
      );
      if (response.status === 200) {
        const { testType, questionNumbers, questionTypes } = response.data;

        setTestType(testType || 'Create Test Paper First');

        // Create an object to store the highest question number for each unique type
        const highestQuestionNumbers = {};

        // Calculate the highest number for each unique question type
        questionTypes.forEach((type, index) => {
          const highestNumber = highestQuestionNumbers[type] || 0;
          if (questionNumbers[index] > highestNumber) {
            highestQuestionNumbers[type] = questionNumbers[index];
          }
        });

        // Filter out unique question types
        const uniqueQuestionTypes = [...new Set(questionTypes)];

        // Organize data by type of test
        const organizedTestData = uniqueQuestionTypes.map((type) => ({
          type,
          highestNumber: highestQuestionNumbers[type],
        }));

        // Filter out entries with no data for "TYPE OF TEST" and "NUMBER OF QUESTIONS"
        const filteredTestData = organizedTestData.filter(
          (item) => item.type && item.highestNumber
        );
          
        // Set the state variable
        setTestData(filteredTestData);
      } else {
        console.error('Error fetching data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const mapTestType = (type) => {
    switch (type) {
      case 'MultipleChoice':
        return 'MULTIPLE CHOICE:  ';
      case 'TrueFalse':
        return 'TRUE OR FALSE:  ';
      case 'Identification':
        return 'IDENTIFICATION:  ';
      default:
        return type; 
    }
  };


  useEffect(() => {
    fetchQtypeandQn();
  }, []);

  return (
    <main className="container-fluid p-sm-4 py-3 h-100">
      <section>
        <div className="d-flex">
          <a className="align-self-center" href="/Classroom/F/Test">
            <img src="/back-arrow.png" alt="Back" />
          </a>
          &nbsp;
          <h3 className="m-0">
            {testnumber}: {testname}
          </h3>
        </div>
        <ul className="d-flex flex-wrap justify-content-around mt-3 list-unstyled">
          <Link 
            href={{
              pathname: "/Test/TestPaper",
              query: {
                testnumber: testnumber,
                testname: testname,
                uid: uid,
                classname: classname,
                classcode: classcode,
                subjectname: subjectname,
              },
            }}className="text-decoration-none link-dark">
            <li className="m-0 fs-5">TEST PAPER</li>
          </Link>
          <a>
            <li className="m-0 fs-5 text-decoration-underline">ANSWER SHEET</li>
          </a>
          <Link href={{
              pathname: "/Test/AnswerKey",
              query: {
                testnumber: testnumber,
                testname: testname,
                uid: uid,
                classname: classname,
                classcode: classcode,
                subjectname: subjectname,
              },
            }}className="text-decoration-none link-dark">
            <li className="m-0 fs-5">ANSWER KEY</li>
          </Link>
          <Link href={{
              pathname: "/Test/Records",
              query: {
                testnumber: testnumber,
                testname: testname,
                uid: uid,
                classname: classname,
                classcode: classcode,
                subjectname: subjectname,
              },
            }} className="text-decoration-none link-dark">
            <li className="m-0 fs-5">RECORDS</li>
          </Link>
        </ul>
        {/* CONTENT */}
        <section className="container-sm mt-5 col-xl-6 py-3 px-4 border border-dark rounded">
        {testData.length > 0 ? (
      testData.map((item, index) => (
        <div key={index} className="row p-sm-2 px-3">
          <p className="col-sm-12 my-1 text-center">
            {mapTestType(item.type)} NUMBER OF QUESTIONS: {item.highestNumber}
          </p>
        </div>
      ))
    ) : (
      <p>No data available</p>
          )}
          <div className="text-center">
            {testData.length > 0 && (
              <button
                className="btn btn-outline-dark px-sm-5 mt-2 mt-sm-0"
                onClick={handleGenerateAnswerSheet}
              >
                GENERATE
              </button>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
