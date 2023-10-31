export default function Video(){
    return(
        <main className="vh-100 d-flex justify-content-center align-items-center ">
            <section className="container h-100 d-flex flex-column justify-content-center align-items-center text-centerc">
                <p>HOW TO USE?</p>
                <div className="d-flex justify-content-center h-50 border border-dark rounded-3 my-2 overflow-auto ">
                    <video className="img-fluid z-index-0" controls>
                        <source src="" type="video"/>
                    </video>
                </div>
                <p className="text-center">YOU CAN DOWNLOAD THE MANUAL <a className="link-primary text-decoration-none">HERE </a>FOR MORE DETAILS</p>
                
            </section>
        </main>
    )
}