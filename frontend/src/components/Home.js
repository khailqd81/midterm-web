import { Link, useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    const handleLogout = () => {
        if (localStorage.getItem("access_token") != null) {
            localStorage.removeItem("access_token");
        }
        navigate("/login")
    }
    return (
        <div>
            <p >HOME PAGE</p>
            <div className="flex justify-center">
                <Link className="px-6 py-4 border border-white radius shadow-xl hover:bg-green-300" to="/login">Login</Link>
                <Link className="px-6 py-4 border border-white radius shadow-xl hover:bg-green-300" to="/register">Register</Link>
                <button className="px-6 py-4 border border-white radius shadow-xl hover:bg-green-300" onClick={handleLogout}>Logout</button>
            </div>

        </div>
    )
}

export default Home;