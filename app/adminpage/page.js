"use client";
import Footer from "@/components/DefaultFix/Footer";
import ADMINPAGE from "@/components/Admin/adminpage";
import Link from "next/link";
export default function adminpage() {
  return (
    <main className="d-flex flex-column vh-100">
      <main className="z-index-3">
        <nav className="navbar w-100 navbar-lg position-relative px-3 bg-danger text-dark">
          <Link href="/">
            <img
              src="/TUPC.svg"
              alt="TUPC"
              width={80}
              height={80}
            />
          </Link>
          <a href="/login" className="text-decoration-none link-dark">Logout</a>
        </nav>
      </main>
      <div>
        <ADMINPAGE />
      </div>
      <div className="z-index">
        <Footer />
      </div>
    </main>
  );
}
