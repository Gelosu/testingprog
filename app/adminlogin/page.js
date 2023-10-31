"use client";
import Footer from "@/components/DefaultFix/Footer";
import NavBar from "@/components/DefaultFix/NavBar";
import AdminLogin from "@/components/LoginPage/AdminLogin";

export default function adminpage() {
  
  return (
    <main>
      <NavBar/>
        <AdminLogin/>
      <Footer/>
    </main>
    
  );
}
