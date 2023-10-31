export default function Contact() {
    return (
      <main className="vh-100 d-flex justify-content-center align-items-center">
        <section className="container row h-75">
          <div className="col-lg-8 h-100 pt-5">
            <h2>FOUND A BUG?</h2>
            <h5>
              SUBMIT A REPORT OR EMAIL US ON&nbsp;
              <a className="link-dark text-decoration-none">endingsonly@gmail.com</a>
            </h5>
            <div className="d-flex flex-column h-50 col-md-8">
              <input
                type="text"
                className="c-size border border-dark rounded p-2 "
                placeholder="Email"
              />
              <textarea
                type="text"
                className="c-size border border-dark rounded h-100 my-2 p-2"
                placeholder="Message"
              />
              <div className="text-end p-0">
                <button className="btn btn-outline-dark px-3">Submit</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
  