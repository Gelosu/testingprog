import style from "../DefaultFix/loading.module.css";

export default function Loading(){
    return(
        <main className="vh-100 d-flex justify-content-center align-items-center">
            <h1 className={style.load}>Loading.....</h1>
        </main>
    )
}