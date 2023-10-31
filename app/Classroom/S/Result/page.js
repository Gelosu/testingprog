import StudentAside from "@/components/DefaultFix/StudentAside";
import Result from "@/components/Result/Result";

export default function ResultPage() {
  return (
    <main className="container-fluid">
      <section className="row">
        <StudentAside />
        <Result />
      </section>
    </main>
  );
}
