import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import ReactLoading from "react-loading";

function ProtectedRoutes() {
    const [isAuth, setIsAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            if (localStorage.getItem("access_token") === null ){
                setIsLoading(false);
                return;
            }
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/isauth`, {
                headers: { 'Authorization': "Bearer " + localStorage.getItem("access_token")}
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
    return isAuth ? <Outlet /> : <Navigate to="/login"/>
}

export default ProtectedRoutes