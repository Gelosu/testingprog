import Link from "next/link";
import Image from "next/image";

export default function NavBar() {
  return (
    <main className="z-index-3">
      <nav className="navbar w-100 position-fixed navbar-lg px-3 bg-danger text-dark">
        <Link href="/">
          <Image src="/TUPC.svg" alt="TUPC" width={80} height={80} priority={true}/>
        </Link>
      </nav>
    </main>
  );
}
