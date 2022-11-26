import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function GroupLink() {

    const navigate = useNavigate();
    const params = useParams();
    const [message, setMessage] = useState("Join group failed")
    useEffect(() => {
        async function joinGroup() {
            const groupLink = params.groupLink;
            let accessToken = localStorage.getItem("access_token");
            if (accessToken === null) {
                console.log("eeee")
                localStorage.setItem("fromJoinGroup", window.location.pathname);
                navigate("/login");
            }
            if (groupLink == null || groupLink.trim().length <= 0) {
                return;
            }
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/groups/join/${groupLink}`, {
                headers: { 'Authorization': "Bearer " + accessToken }
            })
            localStorage.removeItem("fromJoinGroup");
            if (response.status === 200) {
                console.log(response)
                setMessage("You have joined group");
            }
        }
        joinGroup();
    }, [])
    return (
        <div>
            <div className="mt-4 text-center text-2xl">{message}</div>
            <Link className="text-center mb-2 mt-4 block w-full underline" to="/home">Return to Group Page</Link>
        </div>
    )

}

export default GroupLink;