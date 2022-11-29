import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ReactLoading from "react-loading";

function UserConfirm() {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("Verify failed");
    console.log("render")
    useEffect(() => {
        async function verifyTokenFromBackend() {
            try {
                const token = searchParams.get("token");
                const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/confirm?token=${token}`)
                console.log(response)
                setMessage("Verify success")
                setIsLoading(false);
            } catch (error) {
                console.log(error)
                setMessage("Verify failed: " + error.response.data.message);
                setIsLoading(false);
            }
        }
        verifyTokenFromBackend();
    }, [])

    if (isLoading) {
        return (
            <div className="mx-auto h-[100vh] relative">
                <ReactLoading className="absolute mx-auto top-[50%] left-[50%] -translate-x-2/4 -translate-y-1/2" type="spin" color="#7483bd" height={200} width={200} />
            </div>)
    }
    return (
        <div className="max-w-fit mx-auto my-4 py-6 px-10 shadow-lg border rounded-lg bg-white absolute left-[50%] -translate-x-1/2">
            <p className="border border-green-500 text-green-500 p-2 text-center my-2">{message}</p>
            <Link className="text-center mb-2 mt-4 block w-full underline" to="/login">Return to Login Page</Link>
        </div>
    )
}
{/* <div>
            <div className="mt-4 text-center text-2xl">{message}</div>
            <Link className="text-center mb-2 mt-4 block w-full underline" to="/login">Return to Login Page</Link>
        </div> */}
export default UserConfirm;