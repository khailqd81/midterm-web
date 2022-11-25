import axios from "axios";
import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";

function ProtectedRoutes() {
    const navigate = useNavigate();
    const [isAuth, setIsAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            if (localStorage.getItem("access_token") === null) {
                setIsLoading(false);
                return;
            }
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/isauth`, {
                headers: { 'Authorization': "Bearer " + localStorage.getItem("access_token") }
            })
            console.log("response: ", response)
            if (response.status === 200) {
                setIsAuth(true);
            }
            setIsLoading(false);
        }
        checkAuth();
    }, [])

    if (isLoading) {
        return (<div className="mx-auto h-[100vh] relative">
            <ReactLoading className="absolute mx-auto top-[50%] left-[50%] -translate-x-2/4 -translate-y-1/2" type="spin" color="#7483bd" height={200} width={200} />
        </div>)
    }
    const handleLogout = () => {
        if (localStorage.getItem("access_token") != null) {
            localStorage.removeItem("access_token");
        }
        navigate("/login")
    }

    return (isAuth
        ?
        <>
            <header className="flex justify-between px-20 py-4 bg-[#333] w-screen ml-0">
                <ul className="flex text-white m-0 p-0">
                    <li className="mr-4">
                        <Link to="/home" className="no-underline text-[#61dafb]">KahooClone</Link>
                    </li>
                    <li className="mr-4">
                        <Link to="/home" className="no-underline text-white hover:text-[#61dafb]">Home</Link>
                    </li>
                </ul>
                <ul className="flex text-white m-0 p-0">
                    <li className="mr-4 cursor-pointer">User</li>
                    <li className="mr-4 cursor-pointer text-white hover:text-[#61dafb]" onClick={handleLogout}>Logout</li>
                </ul>
            </header>
            <div className="py-8 px-20 min-h-[calc(100vh-112px)]">
                <Outlet />
            </div>
            <footer className="flex justify-center px-20 py-4 bg-[#333] w-screen text-white">
                <p className="m-0">Copyright@HCMUS 2022</p>
            </footer>
        </>
        : <Navigate to="/login" />);
}

export default ProtectedRoutes