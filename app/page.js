"use client";
import About from "@/components/Main/About";
import Contact from "@/components/Main/Contact";
import Hero from "@/components/Main/Hero";
import Instruction from "@/components/Main/Instruction";
import Video from "@/components/Main/Video";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <nav className="position-sticky navbar top-0 w-100 navbar-lg px-3 bg-danger text-dark z-index">
        <a href="/main">
          <img src="/TUPC.svg" height={80} width={80}/>
        </a>
        <div className="d-flex flex-column text-center">
          <a className="text-decoration-none custom-hover" href="/login">
            Login
          </a>
          <a className="text-decoration-none custom-hover" href="/login/Register">
            Register Now
          </a>
        </div>
      </nav>
      <div id="Home">
        <Hero />
      </div>
      <div id="About">
        <About />
      </div>
      <div>
        <Instruction />
      </div>
      <div>
        <Video />
      </div>
      <div>
        <Contact />
      </div>
      <footer className="container-fluid bg-danger text-dark text-lg-start py-3">
        <div className="d-flex justify-content-between align-items-center">
          <a href="/login" className="text-dark text-decoration-none">
            <small className="text-center p-2">© 2023 ENDINGSONLY</small>
          </a>
          <div className="d-flex gap-3 text-center text-sm-start">
            <Link className="text-decoration-none custom-hover" href="#Home">
              <h6 className="m-0">HOME</h6>
            </Link>
            <Link className="text-decoration-none custom-hover" href="#About">
              <h6 className="m-0">ABOUT US</h6>
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
