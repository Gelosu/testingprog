import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";

export default function FacultyRegister() {
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const gsfeRegExp = /@gsfe.tupcavite.edu.ph/;
  const tupcRegExp = /TUPC-\d{2}-\d{4}$/;
  const schema = yup.object().shape({
    TUPCID: yup.string().matches(tupcRegExp, "Invalid TUPC-ID!"),
    SURNAME: yup.string().required("Surname is Required!"),
    FIRSTNAME: yup.string().required("Firstname is Required!"),
    MIDDLENAME: yup.string().required("Middlename is Required!"),
    GSFEACC: yup.string().matches(gsfeRegExp, "Invalid gsfe account!"),
    SUBJECTDEPT: yup.string().required("Please Choose!"),
    PASSWORD: yup.string().required("Password Required!"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const submitForm = async (data) => {
    try {
      setErrorMessage("");
      console.log(data);
      router.push("/login")
      const response = await axios.post(
        "http://localhost:3001/facultyreg",
        data
      );
      console.log(response.data);
      // Redirect or perform any other actions after successful registration
      
      if (response.status === 200) {
        // Student registration successful, redirect or show success message
        console.log("faculty registered successfully!");
        // Redirect or show a success message to the user
        
      } else {
        // Something went wrong with the registration
        console.log("An error occurred while Faculty.");
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // TUPCID already registered, show an error message to the user
        setErrorMessage("TUPCID ALREADY REGISTERED");
      } else {
        console.log(error);
        console.log("An error occurred while registering faculty");
      }
    }
  };

  return (
    <main className="container-sm custom-h py-3 py-sm-5 d-flex justify-content-center align-items-center flex-column">
      <p className="mb-0 fw-bold fs-5 ">FACULTY REGISTRATION</p>
      <section className="container-sm col-lg-6 py-3 px-4 border border-dark rounded">
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">TUPC ID</p>
            <input
              type="text"
              name="TUPCID"
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center"
              {...register("TUPCID")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.TUPCID?.message}
            </small>
          </div>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">SURNAME</p>
            <input
              type="text"
              name="SURNAME"
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center"
              {...register("SURNAME")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.SURNAME?.message}
            </small>
          </div>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">
              FIRST NAME
            </p>
            <input
              type="text"
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center"
              name="FIRSTNAME"
              {...register("FIRSTNAME")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.FIRSTNAME?.message}
            </small>
          </div>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">
              MIDDLE NAME
            </p>
            <input
              type="text"
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center"
              name="MIDDLENAME"
              {...register("MIDDLENAME")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.MIDDLENAME?.message}
            </small>
          </div>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">
              GSFE ACCOUNT
            </p>
            <input
              type="text"
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center"
              name="GSFEACC"
              {...register("GSFEACC")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.GSFEACC?.message}
            </small>
          </div>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">
              SUBJECT DEPARTMENT
            </p>
            <select
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center"
              name="SUBJECTDEPT"
              {...register("SUBJECTDEPT")}
            >
                <option value="none" disabled hidden>
                  Choose...
                </option>
                <option value="DIT">Department of Industrial Technology</option>
                <option value="DED">Department of Industrial Education</option>
                <option value="DES">Department of Engineering Sciences</option>
                <option value="DLA">Department of Liberal Arts</option>
                <option value="DMS">Department of Mathematics and Sciences</option>
            </select>
            <small className="text-sm-end text-center text-danger">
              {errors.SUBJECTDEPT?.message}
            </small>
          </div>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">PASSWORD</p>
            <input
              type="password"
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center"
              name="PASSWORD"
              {...register("PASSWORD")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.PASSWORD?.message}
            </small>
          </div>
          <div className="col-12 text-center">
            {errorMessage && (
              <small className="text-danger">{errorMessage}</small>
            )}
          </div>
          <div className="text-center py-2">
            <button
              className="text-center px-3 py-1 btn btn-outline-dark"
              type="submit"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
