"use client";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ReportProblem() {
  const SearchParams = useSearchParams();
  const gsfeAcc = SearchParams.get("gmail");
  const [messages, setMessage] = useState("");
  const sendEmail = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/sendEmail/${gsfeAcc}/${messages}`
      );
      if (response.status === 200) {
        alert("Thank you, your opinion will ewan");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <main className="custom-m col-11 col-md-10 p-0">
      <div className="d-flex justify-content-start align-items-center">
        <Link href="/">
          <button className="btn btn-outline-none" type="button">
            <img src="/back-arrow.svg" alt="backArrow" height={30} width={40} />
          </button>
        </Link>
        <h4 className="text-dark fw-bold fs-3 my-1">REPORT PROBLEM</h4>
      </div>
      <div className="studrepprobpt mx-auto col-lg-6 row">
        <div className="studsettingbg mx-auto col-lg-9 border border-dark rounded-4 pt-3">
          <form>
            <div className="form-outline mx-4">
              <input
                type="text"
                value={gsfeAcc}
                className="form-control border border-dark rounded-3 mt-1 mb-2"
                disabled
              />
              <textarea
                type="text"
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                placeholder="Message"
                className="form-control border border-dark rounded-3 mt-1 mb-2 pb-5"
              />
            </div>
          </form>
          <div>
            <button
              type="button"
              className="btn btn-outline-dark rounded-3 mt-2 mb-3 studrepmx"
              onClick={sendEmail}
            >
              <h5 className="mb-0">SEND</h5>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
