"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Import the useRouter hook from 'next/router'
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

export default function UpdatePassword() {
  const router = useRouter();
  const [TUPCID, setTUPCID] = useState("");
  const [accountType, setAccountType] = useState("");
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const TUPCIDFromQuery = searchParams.get("TUPCID");
    const accountTypeFromQuery = searchParams.get("accountType");
    if (TUPCIDFromQuery) {
      setTUPCID(TUPCIDFromQuery);
    }
    if (accountTypeFromQuery) {
      setAccountType(accountTypeFromQuery);
    }
  }, [router.query]);
  console.log(TUPCID, accountType);

  const schema = yup.object().shape({
    NewPassword: yup.string().required("Enter a password"),
    ConfirmPassword: yup
      .string()
      .oneOf([yup.ref("NewPassword"), null], "Passwords must match"),
  });

  const { handleSubmit, register, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const submitForm = async (formData) => {
    try {
      const { NewPassword } = formData;

      // Make a PUT request to the server to update the password
      const response = await axios.put(
        `http://localhost:3001/updatepassword/${TUPCID}`,
        {
          PASSWORD: NewPassword,
        }
      );

      // If the request is successful, show a success message and redirect to the login page
      console.log("Password sent to the database:", NewPassword);
      console.log("Response from server:", response.data.message);
      alert(response.data.message);
      router.push("/login");
    } catch (error) {
      // If there is an error, show an error message
      console.error("Error updating password:", error);
      alert("Failed to update password. Please try again.");
    }
  };

  return (
    <main className="container vh-100 d-flex justify-content-center align-items-center">
      <section className="col-lg-5 col-sm-8 col-10 d-flex justify-content-center align-items-center flex-column border border-dark rounded-3 py-5">
        <p className="mb-0 fw-bold fs-5">FORGOT PASSWORD</p>
        <form
          onSubmit={handleSubmit(submitForm)}
          className="text-center d-flex flex-column col-8"
        >
          <div className="row position-relative">
            <input
              type={show ? "text" : "password"}
              className="py-1 px-5 rounded border border-dark mb-1 text-center col-12"
              placeholder="NEW PASSWORD"
              {...register("NewPassword")}
            />
            <a onClick={() => setShow(!show)}>
              <img
                id="ShowHide2"
                src={show ? "/hide.svg" : "/show.svg"}
                alt={show ? "hide" : "show"}
                height={19}
                width={19}
              />
            </a>
          </div>
          <small className="text-danger">{errors.NewPassword?.message}</small>
          <div className="row">
            <input
              type="text"
              className="py-1 px-5 rounded border border-dark mb-1 text-center col-12"
              placeholder="CONFIRM PASSWORD"
              {...register("ConfirmPassword")}
            />
          </div>
          <small className="text-danger">
            {errors.ConfirmPassword?.message}
          </small>
          <div>
            <button
              type="submit"
              className="px-3 mb-3 btn btn-outline-dark col-5"
            >
              Submit
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}