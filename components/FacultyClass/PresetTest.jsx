"use client";

import Link from "next/link";
import { useTupcid } from "@/app/provider";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

export default function PresetTest() {
  const { tupcids } = useTupcid();
  const [selectedYear, setSelectedYear] = useState("");
  const [testpapers, setTestpapers] = useState([]);
  const searchparams = useSearchParams();
  const classname = searchparams.get("classname");
  const subjectname = searchparams.get("subjectname");
  const classcode = searchparams.get("classcode");
  const [receiver, setReceiver] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedUID, setSelectedUID] = useState("");
  const [presetInfo2, setPresetInfo2] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [years, setYears] = useState([]);
  const [inputYear, setInputYear] = useState("");

const fetchAndSetTestpapers = async () => {
  try {
    console.log("Getting presets in...", tupcids);
    const response = await axios.get(
      `http://localhost:3001/getpresets/${tupcids}`
    );
    if (response.status === 200) {
      setTestpapers(response.data);
      // Extract unique years from the testpapers and set them in the state
      const uniqueYears = [...new Set(response.data.map((testpaper) => new Date(testpaper.created_at).getFullYear()))];
      setYears(uniqueYears);
    } else {
      console.error("Error fetching testpapers");
    }
  } catch (error) {
    console.error("Error fetching testpapers:", error);
  }
};

// Initial data fetch and setup
useEffect(() => {
  fetchAndSetTestpapers();
  const interval = setInterval(fetchAndSetTestpapers, 1000);
  return () => clearInterval(interval);
}, [tupcids]);

  const handleSearch = () => {
    if (inputYear === "") {
      // If no year is provided, show all test papers
      setFilteredTestpapers(testpapers);
    } else {
      // Filter test papers based on the input year
      const filtered = testpapers.filter(
        (testpaper) =>
          new Date(testpaper.created_at).getFullYear() === parseInt(inputYear)
      );
      setFilteredTestpapers(filtered);
    }
  };
const renderButtons = (testpaper) => (
  <div className="p-3 d-flex gap-1">
    <img
      className="border-end border-dark pe-1"
      src="/add2.svg"
      alt="add"
      height={30}
      width={30}
      onClick={() => handleAdd(testpaper)}
    />
    <img
      className="border-end border-dark pe-1"
      src="/share.svg"
      alt="share"
      height={30}
      width={30}
      onClick={() => openShareModal(testpaper.uid)}
    />
    <img
      className="pe-1"
      src="/show.svg"
      alt="show"
      height={30}
      width={30}
      onClick={() => handlePreview(testpaper)}
    />
  </div>
);

// Event handlers for the buttons
const handleAdd = async (testpaper) => {
  try {
    const response = await axios.get(
      `http://localhost:3001/getPresetInfo/${testpaper.uid}/${tupcids}`
    );

    if (response.status === 200) {
      const presetInfo = response.data[0]; // Access the first element of the response array
      console.log(" response check...", presetInfo.test_name);

      // Send a POST request to add the preset to the testpapers table
      const addPresetResponse = await axios.post(
        `http://localhost:3001/addPresetToTest/`,
        {
          TUPCID: tupcids,
          class_name: classname,
          subject_name: subjectname,
          class_code: classcode,
          test_name: presetInfo.test_name,
          test_number: presetInfo.test_number,
          thumbnail: presetInfo.thumbnail,
        }
      );

      if (addPresetResponse.status === 200) {
        alert("Preset added to the test successfully")
        console.log('Preset added to the test successfully');
        // You can update your UI or take any other actions here
      } else {
        console.error('Error adding preset to the test');
      }
    } else {
      console.error('Error getting preset information');
    }
  } catch (error) {
    console.error('Error handling add operation:', error);
  }
};

const openShareModal = (uid) => {
  setShowShareModal(true);
  setSelectedUID(uid); // Set the selected UID
  setReceiver(""); // Clear the receiver input
  setPresetInfo2(null); // Clear presetInfo2
};

const closeShareModal = () => {
  setShowShareModal(false);
  setReceiver(""); // Clear recipient input
  setPresetInfo2(null); // Clear presetInfo2
};

const handleShare = async () => {
  try {
    // Send a GET request to check if the recipient's TUPC ID exists in faculty_accounts
    const checkResponse = await axios.get(
      `http://localhost:3001/checkTUPCIDinFaculty?TUPCID=${receiver}`
    );

    if (checkResponse.status === 200 && checkResponse.data.exists) {
      // Recipient's TUPC ID exists, proceed with sharing logic
      console.log("Sharing with recipient:", receiver);

      // Fetch additional information based on the selected `uid`
      const infoResponse = await axios.get(
        `http://localhost:3001/getPresetInfo2/${selectedUID}`
      );

      if (infoResponse.status === 200) {
        const presetInfo2Data = infoResponse.data;
        setPresetInfo2(presetInfo2Data);

        // Send the data to the "sendToRecipient" endpoint
        const shareResponse = await axios.post(
          `http://localhost:3001/sendToRecipient`,
          {
            TUPCID: receiver,
            class_name: 0,
            subject_name: 0,
            class_code: 0,
            presetInfo2: presetInfo2Data,
          }
        );

        if (shareResponse.status === 200) {
          alert('Preset shared successfully')
          console.log('Preset shared successfully');
          // Close the share modal after sharing
          closeShareModal();
        } else {
          console.error('Error sharing preset');
        }
      } else {
        console.error('Error fetching preset information');
      }
    } else {
      console.error('Recipient does not exist or has an invalid TUPC ID');
    }
  } catch (error) {
    console.error('Error handling share operation:', error);
  }
};

const handlePreview = (testpaper) => {
  // Set the image URL for the selected test paper
  setPreviewImageUrl(testpaper.thumbnail); // Replace with the correct property for the image URL

  // Set the modal title dynamically
  setPreviewTitle(`Test Previewing - Test Number: ${testpaper.test_number}, Test Name: ${testpaper.test_name} in ${testpaper.class_name}`); // Customize the title format as needed

  // Show the "Preview" modal
  setShowPreviewModal(true);
};



return (
  <main className="col-11 col-md-10 p-0">
    <section className="container-fluid p-sm-4 py-3 ">
      <div className="d-flex align-items-center">
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
        {/* SHARE MODAL */}
        <div
          className={`modal fade ${showShareModal ? 'show' : ''}`}
          id="shareModal"
          tabIndex="-1"
          aria-labelledby="shareModalLabel"
          aria-hidden={!showShareModal}
          style={{ display: showShareModal ? 'block' : 'none' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="shareModalLabel">
                  Share Test Paper
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={closeShareModal}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-start mb-1">TUPC ID OF RECIPIENT</p>
                <input
                  type="text"
                  className="py-1 px-3 border border-dark w-100 rounded text-start"
                  onChange={(e) => setReceiver(e.target.value)}
                  value={receiver}
                />
                <p className="text-start mb-1">SHARING PRESET UID: {selectedUID}</p>
                
              </div>
              <div className="modal-footer align-self-center">
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  data-bs-dismiss="modal"
                  onClick={handleShare}
                >
                  SHARE
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* End MODAL */}

      {/* "Preview" Modal */}
    <div
      className={`modal fade ${showPreviewModal ? "show" : ""}`}
      id="previewModal"
      tabIndex="-1"
      aria-labelledby="previewModalLabel"
      aria-hidden={!showPreviewModal}
      style={{ display: showPreviewModal ? "block" : "none" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="previewModalLabel">
              {previewTitle}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => setShowPreviewModal(false)}
            ></button>
          </div>
          <div className="modal-body">
            {/* Display the image */}
            <img
              src={previewImageUrl}
              alt="Test Paper Preview"
              className="img-fluid"
            />
          </div>
        </div>
      </div>
    </div>
    {/* End "Preview" Modal */}
        <h2 className="m-0">{tupcids}</h2>
        <h2 className="m-2">{classname} {classcode} {subjectname}</h2>
      </div>
      <div className="d-flex justify-content-between align-items-center ">
        <h3 className="pt-3 m-0 ">PRESETS</h3>
        
      </div>
       {/* List test papers by year */}
       {years.map((year) => (
          <div key={year}>
            <h3 className="pt-3 m-0">{year}</h3>
            {testpapers
              .filter(
                (testpaper) =>
                  new Date(testpaper.created_at).getFullYear() === year
              )
              .map((testpaper) => (
                <div
                  key={testpaper.uid}
                  className="d-flex justify-content-between align-items-center border border-dark text-end pe-2 ps-2 rounded mb-1"
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <span>UID: {testpaper.uid}</span>
                    <span> Test Name: {testpaper.test_name}</span>
                    <span> TEST CREATED IN </span>
                    <span>{testpaper.class_name}</span>
                  </div>
                  {renderButtons(testpaper)}
                </div>
              ))}
          </div>
        ))}
      </section>
    </main>
  );
}