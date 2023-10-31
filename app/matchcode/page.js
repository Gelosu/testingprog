"use client";

import Footer from "@/components/DefaultFix/Footer";
import NavBar from "@/components/DefaultFix/NavBar";
import MatchCode from "@/components/ForgetPassword/Mcode";

export default function matchcode() {
  return (
    <main>
      <div>
        <NavBar />
      </div>
      <div>
        <MatchCode />
      </div>
      <div>
        <Footer />
      </div>
    </main>
  );
}
