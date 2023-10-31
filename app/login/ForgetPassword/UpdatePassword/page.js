import Footer from "@/components/DefaultFix/Footer";
import NavBar from "@/components/DefaultFix/NavBar";
import UpdatePassword from "@/components/ForgetPassword/UPassword";

export default function UpdatePasswordPage() {
  return (
    <main>
      <div>
        <NavBar />
      </div>
      <section>
        <UpdatePassword />
      </section>
      <div>
        <Footer />
      </div>
    </main>
  );
}
