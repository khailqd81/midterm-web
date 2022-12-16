import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactLoading from "react-loading";
function GroupLink() {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const params = useParams();
    const [message, setMessage] = useState("Join group failed");
    useEffect(() => {
        async function joinGroup() {
            const groupLink = params.groupLink;
            let accessToken = localStorage.getItem("access_token");
            if (accessToken === null) {
                localStorage.setItem("fromJoinGroup", window.location.pathname);
                navigate("/login");
            }
            if (groupLink == null || groupLink.trim().length <= 0) {
                return;
            }
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/api/groups/join/${groupLink}`,
                    {
                        headers: { Authorization: "Bearer " + accessToken },
                    }
                );
                localStorage.removeItem("fromJoinGroup");
                if (response.status === 200) {
                    console.log(response);
                    setMessage("You have joined group");
                }
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
            }
        }
        joinGroup();
    }, []);

    if (isLoading) {
        return (
            <div className="mx-auto h-[100vh] relative">
                <ReactLoading
                    className="fixed mx-auto top-[50%] left-[50%] -translate-x-2/4 -translate-y-1/2"
                    type="spin"
                    color="#7483bd"
                    height={100}
                    width={100}
                />
            </div>
        );
    }

    return (
        <div className="max-w-fit mx-auto my-4 py-6 px-10 shadow-lg border rounded-lg bg-white absolute left-[50%] -translate-x-1/2">
            <p className="border border-green-500 text-green-500 p-2 text-center my-2">
                {message}
            </p>
            <Link
                className="text-center mb-2 mt-4 block w-full underline"
                to="/home"
            >
                Return to Home Page
            </Link>
        </div>
    );
}

export default GroupLink;
