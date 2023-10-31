import FacultyArchive from "@/components/Class Archive/FacultyArchive";
import FacultyAside from "@/components/DefaultFix/FacultyAside";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function FacultyClassPage(){
    await wait(1000)
    return(
        <main className="container-fluid">
            <section className="row">
                <FacultyAside/>
                <FacultyArchive/>
            </section>
        </main>
    )
}