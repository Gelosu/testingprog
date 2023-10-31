import Footer from "@/components/DefaultFix/Footer";
import NavBar from "@/components/DefaultFix/NavBar";
import Login from "@/components/LoginPage/Login";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function LoginPage() {
  await wait(1000)
  return (
    <main>
      <div>
        <NavBar />
      </div>
      <div>
        <Login />
      </div>
      <div>
        <Footer />
      </div>
    </main>
  );
}
