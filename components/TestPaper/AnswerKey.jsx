"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useTupcid } from '@/app/provider';
import Link from 'next/link';
import TesseractOCR from './camera/tesseract';
import TextLocalization from './camera/textLocalization';
import ImageWebcam from './camera/imageWebcam';
import TextLocalization2 from './camera/textlocalizationword';
import ImageInput from '@/app/opencv/page';



export default function AnswerKey() {
  

  const { tupcids } = useTupcid();
  const searchParams = useSearchParams();
  const testnumber = searchParams.get('testnumber');
  const testname = searchParams.get('testname');
  const classname = searchParams.get('classname');
  const subjectname = searchParams.get('subjectname');
  const classcode = searchParams.get('classcode');
  const uid = searchParams.get('uid');
  const [testData, setTestData] = useState([]);
  const [testType, setTestType] = useState('No Test Paper Yet');
  const [ImageData, setImageData] = useState(null);
  const [processedImageData, setProcessedImageData] = useState(null);
  
  const handleImageSelected = (retrievedImage) => {
    setImageData(retrievedImage);
    setProcessedImageData(retrievedImage);
  };

 
  const fetchQuestionData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/getquestionstypeandnumberandanswer/${tupcids}/${uid}`
      );
      if (response.status === 200) {
        const { testType: fetchedTestType, questionNumbers, questionTypes, answers } = response.data;

        // Filter out sections with no questions and null testType
        const filteredData = questionTypes.reduce((acc, type, index) => {
          if (type && answers[index]) {
            const questionNumber = questionNumbers[index];
            const answer = answers[index];
            if (!acc[type]) {
              acc[type] = [];
            }
            acc[type].push({ questionNumber, answer });
          }
          return acc;
        }, {});

        // Now filteredData contains data grouped by question type
        const organizedDataArray = Object.entries(filteredData)
          .map(([type, data]) => ({
            type,
            questions: data, // An array of objects with questionNumber and answer
          }));

        // Set the state variable with the organized data
        setTestData(organizedDataArray);
        setTestType(fetchedTestType || 'No Test Paper Created Yet');
      } else {
        console.error('Error fetching data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchQuestionData();
  }, []);

  // Function to convert an Arabic number to a Roman numeral
  const toRoman = (num) => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return romanNumerals[num] || num;
  };


  return (
    <main className="container-fluid p-sm-4 py-3 h-100">
      <section>
        <div className="d-flex ">
          <a className="align-self-center" href="/Classroom/F/Test">
            <img src="/back-arrow.png" />
          </a>

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
            }}
            className="text-decoration-none link-dark"
          >
            <li className="m-0 fs-5">TEST PAPER</li>
          </Link>
          <Link
            href={{
              pathname: "/Test/AnswerSheet",
              query: {
                testnumber: testnumber,
                testname: testname,
                uid: uid,
                classname: classname,
                classcode: classcode,
                subjectname: subjectname,
              },
            }}
            className="text-decoration-none link-dark"
          >
            <li className="m-0 fs-5 text-decoration-none">ANSWER SHEET</li>
          </Link>
          <li className="m-0 fs-5">ANSWER KEY</li>
          <Link
            href={{
              pathname: "/Test/Records",
              query: {
                testnumber: testnumber,
                testname: testname,
                uid: uid,
                classname: classname,
                classcode: classcode,
                subjectname: subjectname,
              },
            }}
            className="text-decoration-none link-dark"
          >
            <li className="m-0 fs-5">RECORDS</li>
          </Link>
        </ul>
        {/* CONTENT */}
        <section className="container-sm mt-5 col-xl-6 py-3 px-4 border border-dark rounded">
          <form className="row">
            <div className="col-6">
              <h5 className="m-0 text-center align-self-center">TEST</h5>
              {/* Map through testData and render each test section */}
              {testData.map((testSection, index) => (
                <div key={index}>
                  <h6 className="col-12 mt-4">
                    {`TEST ${toRoman(index)}`} {/* Apply Roman numeral conversion */}
                  </h6>
                  <ul className="col-6 list-unstyled">
                    {testSection.questions.map((question, qIndex) => (
                      <li key={qIndex}>
                        {`${question.questionNumber}. ${question.answer}`} {/* Display question number and answer */}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="col-6">
              <h5 className="m-0 text-center align-self-center">STUDENT ANSWER</h5>
              {/* Map through testData and render each student answer section */}
              {testData.map((testSection, index) => (
                <div key={index}>
                  <h6 className="col-12 mt-4">
                    {`TEST ${toRoman(index)}`} {/* Apply Roman numeral conversion */}
                  </h6>
                  <ul className="col-6 list-unstyled">
                    {testSection.questions.map((question, qIndex) => (
                      <li key={qIndex}>
                        {`${question.questionNumber}. `}
                        {/* Display a placeholder for the answer (e.g., "blank") */}
                        {'student answer'}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </form>
           <ImageInput onImageSelected={handleImageSelected} />
          
          {ImageData && (
            <div>
              <h4>PREVIEW:</h4>
              <img src={ImageData} alt="Selected" style={{ maxWidth: '100%' }} />
            </div>
          )}
  
          <TextLocalization imageData={processedImageData} /> 
        <TextLocalization2 imageData={processedImageData} /> 
        <TesseractOCR Image={processedImageData} />
        </section>
        {/* END CONTENT */}
      </section>
    </main>
  );
}