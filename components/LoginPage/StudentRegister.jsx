import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";

export default function StudentRegister() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const gsfeRegExp = /@gsfe.tupcavite.edu.ph/;
  const tupcRegExp = /TUPC-\d{2}-\d{4}$/;
  const schema = yup.object().shape({
    TUPCID: yup.string().matches(tupcRegExp, "Invalid TUPC-ID!"),
    SURNAME: yup.string().required("Surname is Needed!"),
    FIRSTNAME: yup.string().required("Firstname is Needed!"),
    MIDDLENAME: yup.string().required("Middle name is Needed! "),
    GSFEACC: yup.string().matches(gsfeRegExp, "Invalid gsfe account!"),
    COURSE: yup.string().required("Please Choose!"),
    SECTION: yup.string().required("Please Choose!"),
    YEAR: yup.string().required("Please Choose!"),
    STATUS: yup.string().required("Please Choose!"),
    PASSWORD: yup.string().required("Password Needed!"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setErrorMessage("");
      const response = await axios.post("http://localhost:3001/studreg", data);
      console.log(response.status)
      console.log(response.data);
      if (response.status === 200) {
        // Student registration successful, redirect or show success message
        console.log("Student registered successfully!");
        // Redirect or show a success message to the user
        router.push("/login");
      } else {
        // Something went wrong with the registration
        console.log("An error occurred while registering student.");
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // TUPCID already registered, show an error message to the user
        setErrorMessage("TUPCID ALREADY REGISTERED");
      } else {
        console.log(error);
        console.log("An error occurred while registering student.");
      }
    }
  };

  return (
    <main className="container-sm custom-h2 py-sm-5 py-3 d-flex justify-content-center align-items-center flex-column">
      <p className="mb-0 fw-bold fs-5 ">STUDENT REGISTRATION</p>
      <section className="container-sm col-lg-6 py-3 px-4 border border-dark rounded">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">TUPC ID</p>
            <input
              type="text"
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
              {...register("GSFEACC")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.GSFEACC?.message}
            </small>
          </div>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">COURSE</p>
            <select
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center "
              {...register("COURSE")}
            >
              <option value="" selected disabled hidden>
                Choose...
              </option>
              <option value="BSCE">BSCE</option>
              <option value="BSEE">BSEE</option>
              <option value="BSME">BSME</option>
              <option value="BSIE ICT">BSIE ICT</option>
              <option value="BSIE IA">BSIE IA</option>
              <option value="BSIE HE">BSIE HE</option>
              <option value="BTTE CP">BTTE CP</option>
              <option value="BTTE EL">BTTE EL</option>
              <option value="BET AT">BET AT</option>
              <option value="BET CT">BET CT</option>
              <option value="BET COET">BET COET</option>
              <option value="BET ET">BET ET</option>
              <option value="BET ESET">BET ESET</option>
              <option value="BET MT">BET MT</option>
              <option value="BET PPT">BET PPT</option>
            </select>
            <small className="text-sm-end text-center text-danger">
              {errors.COURSE?.message}
            </small>
          </div>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">SECTION</p>
            <select
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center"
              {...register("SECTION")}
            >
              <option value="" selected disabled hidden>
                Choose...
              </option>
              <option value="A">A</option>
              <option value="B">B</option>

            </select>
            <small className="text-sm-end text-center text-danger">
              {errors.SECTION?.message}
            </small>
          </div>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">YEAR</p>
            <select
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center"
              {...register("YEAR")}
            >
              <option value="" selected disabled hidden>
                Choose...
              </option>
              <option value="1ST">1ST</option>
              <option value="2ND">2ND</option>
              <option value="3RD">3RD</option>
              <option value="4TH">4TH</option>
            </select>
            <small className="text-sm-end text-center text-danger">
              {errors.YEAR?.message}
            </small>
          </div>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">STATUS</p>
            <select
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center"
              {...register("STATUS")}
            >
              <option value="" selected disabled hidden>
                Choose...
              </option>
              <option value="REGULAR">REGULAR</option>
              <option value="IRREGULAR">IRREGULAR</option>
            </select>
            <small className="text-sm-end text-center text-danger">
              {errors.STATUS?.message}
            </small>
          </div>
          <div className="row p-sm-2 px-3">
            <p className="col-sm-6 my-1 text-sm-start text-center">PASSWORD</p>
            <input
              type="password"
              className="col-sm-6 rounded py-1 px-3 border border-dark text-sm-start text-center"
              {...register("PASSWORD")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.PASSWORD?.message}
            </small>
          </div>
          <div className="text-center">
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
