"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Select from "react-select";
import { useTupcid } from "@/app/provider";
import axios from "axios";


export default function TestPaper() {
  const { tupcids } = useTupcid();
  const searchparams = useSearchParams();
  const testnumber = searchparams.get("testnumber");
  const testname = searchparams.get("testname");
  const classname = searchparams.get("classname");
  const subjectname = searchparams.get("subjectname");
  const classcode = searchparams.get("classcode");
  const uid = searchparams.get("uid");
  const [savedValues, setSavedValues] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadedFromLocalStorage, setLoadedFromLocalStorage] = useState(false);
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [fields, setFields] = useState([]);

  const generateTestPaperdoc = async () => {
    const generateWord = document.getElementById("generateWord").checked;
    const generatePDF = document.getElementById("generatePDF").checked;
  
    if (!generateWord && !generatePDF) {
      // If neither checkbox is checked, show an alert
      alert("Please check at least one option (Word or PDF) before downloading the file.");
    } else {
      if (generateWord) {
        // Generate and download the Word document as before
        try {
          const response = await fetch(
            `http://localhost:3001/generateTestPaperdoc/${uid}`
          );
  
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${testname}_testpaper.docx`;
            a.click();
          } else {
            console.error("Failed to generate Word document.");
          }
        } catch (error) {
          console.error("Error generating Word document:", error);
        }
      }
  
      if (generatePDF) {
        // Generate and download the PDF document as before
        try {
          const response = await fetch(
            `http://localhost:3001/generateTestPaperpdf/${uid}`
          );
  
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${testname}_testpaper.pdf`;
            a.click();
          } else {
            console.error("Failed to generate PDF.");
          }
        } catch (error) {
          console.error("Error generating PDF:", error);
        }
      }
    }
  };
  
  const handleSaveToDocsAndPDF = () => {
    const localStorageKey = `testPaperData_${tupcids}_${classcode}_${uid}`;
    const savedData = JSON.parse(localStorage.getItem(localStorageKey) || "[]");
  
    generateTestPaperdoc(savedData);
  };
  
  // Load data from localStorage when the component mounts

  const questionTypes = [
    { value: "MultipleChoice", label: "Multiple Choice" },
    { value: "TrueFalse", label: "True/False" },
    { value: "Identification", label: "Identification" },
  ];

  const QA = () => {
    const [fields, setFields] = useState([
      {
        questionType: questionTypes[0],
        question: "",
        answer: "",
        score: "1",
        copiedFields: [],
        MCOptions: [
          { label: "A", text: "" },
          { label: "B", text: "" },
          { label: "C", text: "" },
          { label: "D", text: "" },
        ],
        TFOptions: [{ label: "T" }, { label: "F" }],
      },
    ]);

    const localStorageKey = `testPaperData_${tupcids}_${classcode}_${uid}`;
    const localStorageKey2 = `TData_${tupcids}_${classcode}_${uid}`;
    const localStorageKey3 = `QData_${tupcids}_${classcode}_${uid}`;
    const localStorageKey4 = `SData_${tupcids}_${classcode}_${uid}`;
    

    useEffect(() => {
      const savedData = localStorage.getItem(localStorageKey);
      if (savedData) {
        setFields(JSON.parse(savedData));
        setLoadedFromLocalStorage(true);
      }
    }, [localStorageKey]);

    // Modified code to save and retrieve fieldTitleNumbers
    const [fieldTitleNumbers, setFieldTitleNumbers] = useState(() => {
      if (typeof localStorage !== "undefined") {
        const savedFieldTitleNumbers = localStorage.getItem(localStorageKey2);
        return savedFieldTitleNumbers
          ? JSON.parse(savedFieldTitleNumbers)
          : [1];
      } else {
        return [1];
      }
    });
   
    // Modified code to save and retrieve fieldQuestionNumbers
    const [fieldQuestionNumbers, setFieldQuestionNumbers] = useState(() => {
      if (typeof localStorage !== "undefined") {
        const savedFieldQuestionNumbers =
          localStorage.getItem(localStorageKey3);
        return savedFieldQuestionNumbers
          ? JSON.parse(savedFieldQuestionNumbers)
          : [1];
      } else {
        return [1];
      }
    });

    // Modified useEffect to save fieldTitleNumbers and fieldQuestionNumbers
    useEffect(() => {
      if (!fieldTitleNumbers && !fieldQuestionNumbers) return;
      localStorage.setItem(localStorageKey2, JSON.stringify(fieldTitleNumbers));
      localStorage.setItem(
        localStorageKey3,
        JSON.stringify(fieldQuestionNumbers)
      );
    }, [fieldTitleNumbers, fieldQuestionNumbers]);

    const maxScoreFromLocalStorage = localStorage.getItem(localStorageKey4);

    // Initialize `maxScore` with the value from local storage or the default value (10)
    const [maxScore, setMaxScore] = useState(maxScoreFromLocalStorage ? parseInt(maxScoreFromLocalStorage) : 10);
    
    // Update the `maxScore` state and save it to local storage when it changes
    const handleMaxScore = (event) => {
      let value = event.target.value;
      value = value.replace(/[^0-9]/g, "");
      value = Math.min(Math.max(1, parseInt(value) || 1), 100);
    
      setMaxScore(value);
    
      // Save the updated `maxScore` to local storage
      localStorage.setItem(localStorageKey4, value);
    };
    
  const [totalScore, setTotalScore] = useState(0);
  const [scoreDifference, setScoreDifference] = useState(0);

  // Function to calculate and update the total score
  const updateTotalScore = () => {
    const newTotalScore = fields.reduce((acc, field) => {
      const originalScore = parseInt(field.score) || 0;
      const copiedScore = field.copiedFields.reduce((copiedAcc, copiedField) => {
        return copiedAcc + (parseInt(copiedField.score) || 0);
      }, 0);
      return acc + originalScore + copiedScore;
    }, 0);
    
    // Calculate the score difference and update the state
    const newScoreDifference = maxScore - newTotalScore;
    setScoreDifference(newScoreDifference);
    setTotalScore(newTotalScore);
  };
  
  useEffect(() => {
    // Update the total score whenever the fields change
    updateTotalScore();
  }, [maxScore, fields]);

    const addNewField = () => {
      console.log("field eme...", fieldTitleNumbers.length);
      if (fieldTitleNumbers.length > 2) {
        alert("Already reach the maximum type of test")
        return;
      }

      let newQuestionType = questionTypes[1]; // Default to True/False
      const hasMultipleChoice = fields.some(
        (field) => field.questionType?.value === "MultipleChoice"
      );
      const hasTrueFalse = fields.some(
        (field) => field.questionType?.value === "TrueFalse"
      );
      if (!hasMultipleChoice) {
        newQuestionType = questionTypes[0];
      } else if (!hasTrueFalse) {
        newQuestionType = questionTypes[1];
      } else {
        newQuestionType = questionTypes[2];
      }

      const newFieldNumber = fieldTitleNumbers.length + 1;
      setFields((prevFields) => [
        ...prevFields,
        {
          questionType: newQuestionType,
          question: "",
          answer: "",
          score: "1",
          copiedFields: [],
          MCOptions: [
            { label: "A", text: "" },
            { label: "B", text: "" },
            { label: "C", text: "" },
            { label: "D", text: "" },
          ],
          TFOptions: [{ label: "T" }, { label: "F" }],
        },
      ]);
     
      updateTotalScore();
      
      setFieldTitleNumbers((prevNumbers) => [...prevNumbers, newFieldNumber]);
      setFieldQuestionNumbers((prevNumbers) => [...prevNumbers, 1]);
    };
    
    const getExistingQuestionTypes = (currentFieldIndex) => {
      const existingTypes = new Set();

      fields.forEach((field, index) => {
        if (index !== currentFieldIndex && field.questionType) {
          existingTypes.add(field.questionType.value);
        }
      });

      return existingTypes;
    };

    const handleFieldChange = (index, field) => {
      
      const updatedFields = [...fields];
    
      // Ensure the score is at least 1
      const score = Math.min(Math.max(1, parseInt(field.score) || 1), 10);
      updatedFields[index] = { ...field, score: score };
    
      if (field.questionType && field.questionType.value === "TrueFalse") {
        updatedFields[index].answer = field.answer;
      } else if (field.questionType && field.questionType.value === "MultipleChoice") {
        updatedFields[index].answer = field.answer;
    
        // Update the answer for each option
        updatedFields[index].MCOptions.forEach((option, optionIndex) => {
          if (option.label === field.answer) {
            option.text = field.MCOptions[optionIndex].text;
          }
        });
      } else {
        updatedFields[index].answer = field.answer;
      }
    
      // Update the score for copied fields when changing the score in the original field
      updatedFields[index].copiedFields.forEach((copiedField) => {
        copiedField.score = score;
      });
    
      setFields(updatedFields);
    
      // Calculate the current score
      updateTotalScore();
      setSaveButtonDisabled(false);
     
    
    };
    

    
    const addRadioOption = (index, copiedIndex) => {
      const updatedFields = [...fields];
      if (copiedIndex === undefined) {
        if (!updatedFields[index].MCOptions) {
          updatedFields[index].MCOptions = [];
        }
        if (updatedFields[index].MCOptions.length < 5) {
          const newOption = String.fromCharCode(
            65 + updatedFields[index].MCOptions.length
          );
          updatedFields[index].MCOptions.push({ label: newOption, text: "" });
          setFields(updatedFields);
        } else {
          console.error("Cannot add more options. Maximum of 5 options allowed.");
        }
      } else {
        if (!updatedFields[index].copiedFields[copiedIndex].MCOptions) {
          updatedFields[index].copiedFields[copiedIndex].MCOptions = [];
        }
        if (
          updatedFields[index].copiedFields[copiedIndex].MCOptions.length < 5
        ) {
          const newOption = String.fromCharCode(
            65 + updatedFields[index].copiedFields[copiedIndex].MCOptions.length
          );
          updatedFields[index].copiedFields[copiedIndex].MCOptions.push({
            label: newOption,
            text: "",
          });
          setFields(updatedFields);
        } else {
          console.error("Cannot add more options. Maximum of 5 options allowed.");
        }
      }
    };
  
    const subtractRadioOption = (index, copiedIndex) => {
      const updatedFields = [...fields];
      
      if (copiedIndex === undefined) {
        if (updatedFields[index].MCOptions.length > 3) {
          updatedFields[index].MCOptions.pop();
        } else {
          console.error("Cannot subtract option. Minimum of 3 options required.");
        }
      } else if (
        updatedFields[index].copiedFields &&
        updatedFields[index].copiedFields[copiedIndex].MCOptions
      ) {
        if (
          updatedFields[index].copiedFields[copiedIndex].MCOptions.length > 3
        ) {
          updatedFields[index].copiedFields[copiedIndex].MCOptions.pop();
        } else {
          console.error("Cannot subtract option. Minimum of 3 options required.");
        }
      }
      setFields(updatedFields);
    };

    const handleOptionTextChange = (index, optionIndex, text) => {
      const updatedFields = [...fields];
      if (
        updatedFields[index].MCOptions &&
        updatedFields[index].MCOptions[optionIndex]
      ) {
        updatedFields[index].MCOptions[optionIndex].text = text;
        setFields(updatedFields);
      }
    };

    const handleOptionTextChangeForCopiedField = (
      index,
      copiedIndex,
      optionIndex,
      text
    ) => {
      const updatedFields = [...fields];
      if (
        updatedFields[index].copiedFields[copiedIndex].MCOptions &&
        updatedFields[index].copiedFields[copiedIndex].MCOptions[optionIndex]
      ) {
        updatedFields[index].copiedFields[copiedIndex].MCOptions[
          optionIndex
        ].text = text;
        setFields(updatedFields);
      }
    };

    const handleCopyField = (index, copiedIndex) => {
      const updatedFields = [...fields];
      const copiedField = {
        ...fields[index], // Copy properties from the original field
        question: "", // Reset the question for the copied field
        answer: "", // Reset the answer for the copied field
        copiedFields: [],
      };
    
      // If the question type is "MultipleChoice," initialize MCOptions with default choices
      if (copiedField.questionType.value === "MultipleChoice") {
        copiedField.MCOptions = [
          { label: "A", text: "" },
          { label: "B", text: "" },
          { label: "C", text: "" },
          { label: "D", text: "" },
        ];
      }
    
      if (!updatedFields[index].copiedFields) {
        updatedFields[index].copiedFields = [];
      }
      updatedFields[index].copiedFields.splice(copiedIndex + 1, 0, copiedField);
    
      setFields(updatedFields);
    
      // Update the total score when copying an empty field
      updateTotalScore();
      
      
    };
    
    
    

    const shuffleArray = (array) => {
      const shuffledArray = [...array];
      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
      }
      return shuffledArray;
    };

    const handleCopyFieldData = (index, copiedIndex) => {
      const updatedFields = [...fields];
  
      if (!updatedFields[index].copiedFields) {
        updatedFields[index].copiedFields = [];
      }
  
      const sourceQuestion = copiedIndex === undefined ? updatedFields[index] : updatedFields[index].copiedFields[copiedIndex];
  
      const originalLabels = sourceQuestion.MCOptions.map(option => option.label);
      const shuffledLabels = shuffleArray(originalLabels);
  
      // Ensure the shuffled labels are different from the original order
      while (shuffledLabels.every((label, i) => label === originalLabels[i])) {
        shuffleArray(shuffledLabels);
      }
  
      // Create a new set of MCOptions with shuffled text but original labels
      const shuffledMCOptions = sourceQuestion.MCOptions.map((option, optionIndex) => ({
        label: option.label,
        text: sourceQuestion.MCOptions.find(originalOption => originalOption.label === shuffledLabels[optionIndex]).text,
      }));
  
      const copiedData = {
        questionType: sourceQuestion.questionType,
        question: sourceQuestion.question,
        answer: sourceQuestion.answer,
        score: sourceQuestion.score,
        MCOptions: shuffledMCOptions,
        TFOptions: sourceQuestion.TFOptions.map(option => ({ ...option })), // Deep copy TFOptions
      };
  
      if (copiedIndex === undefined) {
        updatedFields[index].copiedFields.splice(index, 0, copiedData);
      } else {
        updatedFields[index].copiedFields.splice(copiedIndex + 1, 0, copiedData);
      }
  
      setFields(updatedFields);
    };
    
    const handleReset = (index, copiedIndex) => {
      const updatedFields = [...fields];
      if (copiedIndex === undefined) {
        updatedFields[index] = {
          ...fields[index],
          question: "",
          answer: "",
          MCOptions: fields[index].MCOptions.map((option) => ({
            ...option,
            text: "", // Reset text for MultipleChoice options
          })),
        };
      } else {
        updatedFields[index].copiedFields[copiedIndex] = {
          ...fields[index].copiedFields[copiedIndex],
          question: "",
          answer: "",
          MCOptions: fields[index].copiedFields[copiedIndex].MCOptions.map(
            (option) => ({
              ...option,
              text: "", // Reset text for MultipleChoice options
            })
          ),
        };
      }
      setFields(updatedFields);
    };

    const handleRemoveCopiedField = (fieldIndex, copiedIndex) => {
      const updatedFields = [...fields];
      updatedFields[fieldIndex].copiedFields.splice(copiedIndex, 1);
      setFields(updatedFields);
    };

    const handleRemoveField = (index) => {
      const updatedFields = [...fields];
      updatedFields.splice(index, 1);

      // Update the TYPE numbers for the remaining fields
      const updatedFieldTitleNumbers = updatedFields.map(
        (field, i) => fieldTitleNumbers[i]
      );
      const updatedFieldQuestionNumbers = updatedFields.map(
        (field, i) => fieldQuestionNumbers[i]
      );

      setFields(updatedFields);
      setFieldTitleNumbers(updatedFieldTitleNumbers);
      setFieldQuestionNumbers(updatedFieldQuestionNumbers);
    };

    const handleQuestionTypeChange = (index, selectedOption) => {
      const updatedFields = [...fields];
      updatedFields[index] = {
        questionType: selectedOption,
        question: "",
        answer: "",
        score: "1",
        copiedFields: [],
        MCOptions: [
          { label: "A", text: "" },
          { label: "B", text: "" },
          { label: "C", text: "" },
          { label: "D", text: "" },
        ],
        TFOptions: [{ label: "T" }, { label: "F" }],
      };
      setFields(updatedFields);
    };

    
    const handleSave = async () => {
      const localStorageKey = `testPaperData_${tupcids}_${classcode}_${uid}`;

      

      const savedData = JSON.parse(
        localStorage.getItem(localStorageKey) || "[]"
      ); 
 
      const typeScores = {};
      localStorage.setItem(localStorageKey, JSON.stringify(fields));

      const updatedSavedValues = [];

      

      fields.forEach((field, index) => {
        const questionData = {
          type: `TYPE ${fieldTitleNumbers[index]}`,
          questionType: field.questionType ? field.questionType.value : null,
          questionNumber: fieldQuestionNumbers[index],
          question: field.question ? field.question.toUpperCase() : "",
          score: Math.round(parseFloat(field.score) || 0),
        };

        if (
          field.questionType &&
          field.questionType.value === "MultipleChoice"
        ) {
          questionData.options = field.MCOptions.map((option) => ({
            label: option.label,
            text: option.text ? option.text.toUpperCase() : "",
          }));

          // Save the selected answer for MultipleChoice
          questionData.answer = field.answer;
        } else {
          questionData.answer = field.answer ? field.answer.toUpperCase() : "";
        }

        updatedSavedValues.push(questionData);

        if (field.copiedFields.length > 0) {
          field.copiedFields.forEach((copiedField, copiedIndex) => {
            const copiedQuestionData = {
              type: `TYPE ${fieldTitleNumbers[index]}`,
              questionType: field.questionType
                ? field.questionType.value
                : null,
              questionNumber: fieldQuestionNumbers[index] + copiedIndex + 1,
              question: copiedField.question
                ? copiedField.question.toUpperCase()
                : "",
              score: Math.round(parseFloat(field.score) || 0),
            };

            if (
              field.questionType &&
              field.questionType.value === "MultipleChoice"
            ) {
              // Save all radio button options and their text for copied fields
              copiedQuestionData.options = copiedField.MCOptions.map(
                (option) => ({
                  label: option.label,
                  text: option.text ? option.text.toUpperCase() : "",
                })
              );

              // Save the selected answer for copied fields
              copiedQuestionData.answer = copiedField.answer;
            } else {
              copiedQuestionData.answer = copiedField.answer
                ? copiedField.answer.toUpperCase()
                : "";
            }

            updatedSavedValues.push(copiedQuestionData);
          });
        }
      });

      savedData.forEach((data) => {
        const type = data.type;
        if (typeScores[type]) {
          typeScores[type] += data.score;
        } else {
          typeScores[type] = data.score;
        }
      });

      const totalScore = updatedSavedValues.reduce((total, data) => total + data.score, 0);
  const scoreDifference = maxScore - totalScore;
  const typeScores2 = { 'Total Score': totalScore };
  updatedSavedValues.push(typeScores2);

 
  setSaveButtonDisabled(true);

      setSavedValues(updatedSavedValues);
       

      try {
        console.log("DATA SENDING....", updatedSavedValues);

        if (savedData.length > 0) {
          // Data already exists, perform a PUT request to update it in the testpaper table
          const response1 = await axios.put(
            `http://localhost:3001/updatetestpaper/${tupcids}/${classcode}/${uid}`,
            {
              data: updatedSavedValues,
            }
          );

          if (response1.status === 200) {
            setErrorMessage("Data updated successfully.");
          } else {
            setErrorMessage("Error updating data. Please try again.");
          }

          // Update data in the preset and testforstudents tables
          const response2 = await axios.put(
            `http://localhost:3001/updatetestpaperinpresetandtestpaper/${tupcids}/${classcode}/${testname}/${testnumber}`,
            {
              data: updatedSavedValues,
            }
          );

          if (response2.status === 200) {
            setErrorMessage("Data updated successfully.");
          } else {
            setErrorMessage("Error updating data. Please try again.");
          }
        } else {
          // If no data exists, perform a POST request to create new data
          const response = await axios.post(
            "http://localhost:3001/createtestpaper",
            {
              TUPCID: tupcids,
              test_name: testname,
              test_number: testnumber,
              class_name: classname,
              class_code: classcode,
              subject_name: subjectname,
              uid: uid,
              data: updatedSavedValues,
            }
          );

          if (response.status === 200) {
            setErrorMessage("Data saved successfully.");
          } else {
            setErrorMessage("Error saving data. Please try again.");
          }

          // Also update data in the preset and testpaper tables
          const response2 = await axios.put(
            `http://localhost:3001/updatetestpaperinpresetandtestpaper/${tupcids}/${classcode}/${testname}/${testnumber}`,
            {
              data: updatedSavedValues,
            }
          );

          if (response2.status === 200) {
            setErrorMessage("Data updated successfully.");
          } else {
            setErrorMessage("Error updating data. Please try again.");
          }
        }
    setSaveButtonDisabled(true);
   
      } catch (error) {
        console.error("Error saving/updating data:", error);
        setErrorMessage("Error saving/updating data. Please try again.");
      }
    
      
      
     
    };

    
    
    
    //beta testing document

    return (
      <div className="d-flex flex-column justify-content-center align-items-center container-sm col-lg-8 col-11 border border-dark rounded py-2">
        {fields.map((field, index) => (
          <fieldset className="row col-lg-9 col-11 justify-content-center" key={index}>
            <legend className="p-0">
              TYPE {fieldTitleNumbers[index]}
              <p>
                Score: {totalScore}/{maxScore}
              </p>
              <label>TOTAL SCORE:</label>
              <input
  type="number"
  placeholder="Max Score (1-100)"
  value={maxScore}
  onChange={handleMaxScore}
  min="10"
  max="100"
/>

            </legend>
            <div className="row align-items-center p-0">
            
              <span className="col-2 p-0 ">TYPE OF TEST:</span>
          

              <Select
                className="col-8"
                options={questionTypes.filter(
                  (option) => !getExistingQuestionTypes(index).has(option.value)
                )}
                value={field.questionType}
                onChange={(selectedOption) =>
                  handleQuestionTypeChange(index, selectedOption)
                }
                placeholder="Select Question Type"
              />

              <input
                className="col-2 py-1 rounded border border-dark"
                type="number"
                placeholder="Score per question"
                value={field.score}
                onChange={(e) =>
                  handleFieldChange(index, { ...field, score: e.target.value })
                }
              />

            </div>

            <div className="col-12 p-0">
              <div>QUESTION NO. {fieldQuestionNumbers[index]}</div>
            </div>
            <div className="row p-0 mb-1"></div>
            <input
              className="col-12 border border-dark rounded py-1 px-3 mb-1"
              type="text"
              placeholder="Question"
              value={field.question}
              onChange={(e) =>
                handleFieldChange(index, { ...field, question: e.target.value })
              }
            />

            {field.questionType && field.questionType.value === "TrueFalse" ? (
              <div className="p-0">
                {field.TFOptions.map((option, optionIndex) => (
                  <div key={optionIndex}>
                    <label>
                      <input
                        type="radio"
                        value={option.label}
                        checked={field.answer === option.label}
                        onChange={(e) =>
                          handleFieldChange(index, {
                            ...field,
                            answer: e.target.value,
                          })
                        }
                      />
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            ) : field.questionType &&
              field.questionType.value === "MultipleChoice" ? (
              <div>
                {field.MCOptions.map((option, optionIndex) => (
                  <div key={optionIndex} className="mb-1">
                    <label className="col-1">
                      <input
                        type="radio"
                        value={option.label}
                        checked={field.answer === option.label}
                        onChange={(e) =>
                          handleFieldChange(index, {
                            ...field,
                            answer: e.target.value,
                          })
                        }
                      />
                      {option.label}
                    </label>
                    <input
                      className="border border-dark rounded py-1 px-3"
                      type="text"
                      placeholder="Enter text"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionTextChange(
                          index,
                          optionIndex,
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
                 
                <div className="d-flex gap-2 mb-1">
                  <button
                    onClick={() => addRadioOption(index)}
                    className="border border-dark rounded py-1 px-3"
                  >
                    + Option
                  </button>
                  <button
                    onClick={() => subtractRadioOption(index)}
                    className="border border-dark rounded py-1 px-3"
                  >
                    - Option
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-0">
                <input
                  className="col-12 border border-dark rounded mb-1 py-1 px-3"
                  type="text"
                  placeholder="Answer"
                  value={field.answer}
                  onChange={(e) =>
                    handleFieldChange(index, {
                      ...field,
                      answer: e.target.value,
                    })
                  }
                />
              </div>
            )}
            <div className="d-flex gap-1">
              <button
                className="border border-dark rounded col-1 py-1"
                onClick={() => handleReset(index)}
              >
                <img
                  src="/reset.svg"
                  alt="reset"
                  height={20}
                  width={20}
                  className="pb-1"
                />
              </button>

              <button
                className="col-2 border border-dark rounded px-3"
                onClick={() => handleCopyFieldData(index)}
              >
                Copy
              </button>
            </div>

            {/* for copyfield as sub field */}

            {field.copiedFields.length > 0 && (
              <div className="p-0 row justify-content-center">
                {field.copiedFields.map((copiedField, copiedIndex) => (
                  <div
                    className="p-0 col-12"
                    key={copiedIndex}
                    style={{ marginBottom: "10px" }}
                  >
                    <div>
                      QUESTION NO.{" "}
                      {fieldQuestionNumbers[index] + copiedIndex + 1}
                    </div>

                    <div className="p-0 mb-1">
                      <input
                        className="col-12 border border-dark rounded px-3 py-1"
                        type="text"
                        placeholder="Question"
                        value={copiedField.question}
                        onChange={(e) =>
                          handleFieldChange(index, {
                            ...field,
                            copiedFields: field.copiedFields.map((cf, cIndex) =>
                              cIndex === copiedIndex
                                ? { ...cf, question: e.target.value }
                                : cf
                            ),
                          })
                        }
                      />
                    </div>

                    {field.questionType &&
                    field.questionType.value === "TrueFalse" ? (
                      <div>
                        {field.TFOptions.map((option, optionIndex) => (
                          <div key={optionIndex}>
                            <label>
                              <input
                                type="radio"
                                value={option.label}
                                checked={copiedField.answer === option.label}
                                onChange={(e) =>
                                  handleFieldChange(index, {
                                    ...field,
                                    copiedFields: field.copiedFields.map(
                                      (cf, cIndex) =>
                                        cIndex === copiedIndex
                                          ? { ...cf, answer: e.target.value }
                                          : cf
                                    ),
                                  })
                                }
                              />
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : field.questionType &&
                      field.questionType.value === "MultipleChoice" ? (
                      <div>
                        {copiedField.MCOptions.map((option, optionIndex) => (
                          <div key={optionIndex}>
                            <label className="col-1">
                              <input
                                type="radio"
                                value={option.label}
                                checked={copiedField.answer === option.label}
                                onChange={(e) =>
                                  handleFieldChange(index, {
                                    ...field,
                                    copiedFields: field.copiedFields.map(
                                      (cf, cIndex) =>
                                        cIndex === copiedIndex
                                          ? { ...cf, answer: e.target.value }
                                          : cf
                                    ),
                                  })
                                }
                              />
                              {option.label}
                            </label>
                            <input
                              className="py-1 px-3 border border-dark rounded mb-1"
                              type="text"
                              placeholder="Enter text"
                              value={option.text}
                              onChange={(e) =>
                                handleOptionTextChangeForCopiedField(
                                  index,
                                  copiedIndex,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ))}
                        <div className="d-flex gap-2 mb-1">
                          <button
                            className="border border-dark rounded py-1 px-3"
                            onClick={() => addRadioOption(index, copiedIndex)}
                          >
                            + Option
                          </button>
                          <button
                            className="border border-dark rounded py-1 px-3"
                            onClick={() =>
                              subtractRadioOption(index, copiedIndex)
                            }
                          >
                            - Option
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          className="border border-dark rounded col-12 px-3 py-1 mb-1"
                          type="text"
                          placeholder="Answer"
                          value={copiedField.answer}
                          onChange={(e) =>
                            handleFieldChange(index, {
                              ...field,
                              copiedFields: field.copiedFields.map(
                                (cf, cIndex) =>
                                  cIndex === copiedIndex
                                    ? { ...cf, answer: e.target.value }
                                    : cf
                              ),
                            })
                          }
                        />
                      </div>
                    )}
                    <div className="d-flex gap-2">
                      <button
                        className="col-1 border border-dark rounded py-1"
                        onClick={() => handleReset(index, copiedIndex)}
                      >
                        <img
                          src="/reset.svg"
                          alt="reset"
                          height={20}
                          width={20}
                          className="pb-1"
                        />
                      </button>

                      <button
                        className="col-1 border border-dark rounded py-1"
                        onClick={() =>
                          handleRemoveCopiedField(index, copiedIndex)
                        }
                      >
                        <span className="p-2">-</span>
                      </button>

                      <button
                        className="py-1 px-3 border border-dark rounded col-2"
                        onClick={() => handleCopyFieldData(index, copiedIndex)}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="d-flex mb-1 mt-1 gap-1">
              
              <button
                className="py-1 px-3 border border-dark rounded"
                onClick={() =>
                  handleCopyField(index, field.copiedFields.length)
                }
                disabled={scoreDifference <= 0}
              >
                Add new Test
              </button>

              <button
                className="py-1 px-3 border border-dark rounded"
                onClick={() => handleRemoveField(index)}
              >
                Remove Test {fieldTitleNumbers[index]}
              </button>
            </div>
          </fieldset>
        ))}
       <div>
      <p>Remaining Score: {scoreDifference}</p>
    </div>

    {errorMessage && <p className="error-message">{errorMessage}</p>}       
        <div className="d-flex gap-2">
          <button
            className="py-1 px-3 border border-dark rounded"
            onClick={addNewField}
          >
            Add New Type
          </button>
          <button
  className="py-1 px-3 border border-dark rounded"
  onClick={handleSave}
  disabled={isSaveButtonDisabled || scoreDifference !== 0 || fields.some((f) => !f.question || !f.answer)}
>
  Save All
</button>


        </div>
        <input type="checkbox" id="generateWord" /> Generate Word
<input type="checkbox" id="generatePDF" /> Generate PDF

        <div className="d-flex gap-1 mt-1">
          <button
            className="border border-dark rounded py-1 px-3"
            onClick={handleSaveToDocsAndPDF}
          >
            Download File
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="container-fluid p-sm-4 py-3 h-100">
      <section>
        <div className="d-flex ">
          <Link
            href={{
              pathname: "/Classroom/F/Test",
              query: {
                classname: classname,
                classcode: classcode,
                subjectname: subjectname,
              },
            }}
          >
            <img src="/back-arrow.svg" height={30} width={40} />
          </Link>
          &nbsp;
          <h3 className="m-0">
            {testnumber}:{testname}
          </h3>
        </div>
        <ul className="d-flex flex-wrap justify-content-around mt-3 list-unstyled">
          <li className="m-0 fs-5 text-decoration-underline">TEST PAPER</li>
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
            <li className="m-0 fs-5">ANSWER SHEET</li>
          </Link>
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
            }} className="text-decoration-none link-dark">
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
            }}className="text-decoration-none link-dark">
            <li className="m-0 fs-5">RECORDS</li>
          </Link>
        </ul>
        <QA />
        {errorMessage && <div className="text-danger">{errorMessage}</div>}
      </section>
    </main>
  );
}
