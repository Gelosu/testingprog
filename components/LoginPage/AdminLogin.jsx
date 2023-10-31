import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
const AdminLogin = () => {
  const [error, setError] = useState("");
  const router = useRouter();
  const [show, setShow] = useState(false);
  const handleAdminLogin = async (event) => {
    event.preventDefault();
    const adminName = event.target.elements.ADMINNAME.value;

    const passWord = event.target.elements.PASSWORD.value;
    try {
      const response = await axios.post("http://localhost:3001/adminlogin", {
        adminName,
        passWord,
      });
      const isAuthenticated = response.data.isAuthenticated;
      if (isAuthenticated) {
        console.log("Login successful");
        router.push("/adminpage");
      } else {
        setError("Invalid admin name");
        console.log("Invalid admin name");
      }
    } catch (error) {
      setError("Wrong Password / Account not found");
      console.error("Error during login:", error);
    }
  };
  // useEffect to handle errors and redirect to login page
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError("");
        router.push("/login"); // Redirect back to the login page 
      }, 3000); // Redirect after 3 seconds
    }
  }, [error, router]);
  return (
    <main className="container vh-100 d-flex justify-content-center align-items-center">
      <section className="col-lg-6 col-sm-10 col-11 d-flex justify-content-center align-items-center flex-column border border-dark rounded-3 p-3 py-5">
        <p className="mb-0 fw-bold fs-5">ADMIN PAGE</p>
        <form
          onSubmit={handleAdminLogin}
          className="d-flex flex-column col-lg-8 col-sm-9 col-11"
        >   
        <div className="row mt-2 mb-2">
          <p className="col-5 align-self-center p-0 m-0">ADMIN NAME</p>
            <input
              type="text"
              className="col-7 py-1 px-5 rounded border border-dark mb-1 text-center "
              name="ADMINNAME"
            />
          </div>
          <div className="row position-relative mb-2">
            <p className="col-5 align-self-center p-0 m-0">PASSWORD</p>
            <input
              type={show ? "text" : "password"}
              className="col-7 py-1 px-5 rounded border border-dark mb-1 text-center"
              placeholder="NEW PASSWORD"
              name="PASSWORD"
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
          {error && <small className="mb-2 text-danger text-center">{error}</small>}
          <div className="text-center mt-1">
            <button type="submit" className="px-3 mb-3 btn btn-outline-dark">
              LOGIN
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};
export default AdminLogin;
