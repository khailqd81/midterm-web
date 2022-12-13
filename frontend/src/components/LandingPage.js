import { Link } from "react-router-dom";
import landingImg from "../landing-page-img.jpeg"
function LandingPage() {
    return (
        <div>
            <header className="flex justify-between px-20 py-4 bg-[#333] ml-0">
                <ul className="flex text-white m-0 p-0">
                    <li className="mr-4">
                        <Link to="/" className="no-underline text-[#61dafb]">KahooPaTiKa</Link>
                    </li>
                </ul>
                <ul className="flex text-white m-0 p-0">
                    <li className="mr-4">
                        <Link to="/login" className="no-underline text-white hover:text-[#61dafb]">
                            Sign In
                        </Link>

                    </li>
                    <li className="mr-4">
                        <Link to="/register" className="no-underline text-white hover:text-[#61dafb]">
                            Sign Up
                        </Link>

                    </li>
                </ul>
            </header>
            <div className="flex flex-col min-h-[calc(100vh-112px)] text-center text-xl ">
                <h1 className="mb-4 mt-10 mx-10 font-extrabold text-transparent text-5xl bg-clip-text bg-gradient-to-r from-sky-400 to-pink-500">
                    Create truly unique presentations and connect with your audience.
                </h1>

                <div className="mx-auto max-w-[80vw]">
                    <img src={landingImg} className="w-full shadow-lg rounded-lg" alt="Slide presentation picture" />
                </div>

            </div>
            <footer className="flex justify-center px-20 py-4 bg-[#333] w-screen text-white">
                <p className="m-0">Copyright@HCMUS-19120250 Phạm Tiến Khải 2022</p>
            </footer>
        </div>
    )
    //bg-gradient-to-r from-indigo-500
}

export default LandingPage;