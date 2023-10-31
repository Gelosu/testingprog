import Footer from "@/components/DefaultFix/Footer";
import NavBar from "@/components/DefaultFix/NavBar";
import ForgotPassword from "@/components/ForgetPassword/FPassword";

export default function ForgetPasswordPage(){
    return(
        <main>
            <NavBar/>
            <section>
                <ForgotPassword/>
            </section>
            <Footer/>
        </main>
    )
}