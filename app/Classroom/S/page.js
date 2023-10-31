"use client"
import StudentArchive from "@/components/Class Archive/StudentArchive";
import StudentAside from "@/components/DefaultFix/StudentAside";

export default function StudentClassPage(){
    return(
        <main className="container-fluid">
            <section className="row">
                <StudentAside/>
                <StudentArchive/>
            </section>
        </main>
    )
}