"use client";

import { useState } from "react";
import { useRouter} from "next/navigation";
import axios from "axios";


export default function ForgetPassword() {
  const [TUPCID, setTUPCID] = useState("");
  const [GSFEACC, setGSFEACC] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [accountType, setAccountType] = useState("");
  const router = useRouter();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      // Make the API request to fetch the accountType based on TUPCID
      const { data } = await axios.get(
        `http://localhost:3001/getaccounttype?TUPCID=${TUPCID}`
      );

      // Check if the API call was successful and accountType is available
      if (data.accountType) {
        // Make the API request to send the code
        await axios.post("http://localhost:3001/forgotpassword", {
          TUPCID,
          GSFEACC,
        });

        // Success, show the success message when code is sent
        setResponseMessage(
          "Code sent successfully. Please check your GSFE Account."
        );
        // Extract the accountType from the data object
        const { accountType } = data;
        console.log(accountType);
        console.log(TUPCID);
        
        // Redirect to the MatchCode page with TUPCID and accountType as query parameters
        router.push(`/matchcode?TUPCID=${TUPCID}&accountType=${accountType}`);
      } else {
        // Show a message indicating that the account type was not found
        setError("Account type not found for the provided TUPCID");
      }
    } catch (error) {
      // Error making the API request
      console.error("Error occurred while making the API request:", error);
      setError("Failed to communicate with the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container vh-100 d-flex justify-content-center align-items-center">
      <section className="col-lg-5 d-flex justify-content-center align-items-center flex-column border border-dark rounded-3 py-5">
        <p className="mb-0 fw-bold fs-5">FORGOT PASSWORD</p>
        <p className="fw-light text-center px-3">
          Enter your GSFE account to reset your password
        </p>
        <form
          onSubmit={handleFormSubmit}
          className="text-center d-flex flex-column"
        >
          <input
            type="text"
            className="py-1 px-3 rounded border border-dark mb-3 text-center"
            placeholder="TUPC-**-****"
            value={TUPCID}
            onChange={(e) => setTUPCID(e.target.value)}
          />
          <input
            type="text"
            className="py-1 px-3 rounded border border-dark mb-3 text-center"
            placeholder="GSFE ACCOUNT"
            value={GSFEACC}
            onChange={(e) => setGSFEACC(e.target.value)}
          />

          {responseMessage && (
            <small className="mb-2 text-success">{responseMessage}</small>
          )}
          {error && <small className="mb-2 text-danger">{error}</small>}
          <div>
            
              <button
                type="submit"
                className="px-3 mb-3 btn btn-outline-dark col-5"
                disabled={isSubmitting}
              >
                {isSubmitting ? <span>Loading...</span> : "Submit"}
              </button>
      
          </div>
        </form>
      </section>
    </main>
  );
}
