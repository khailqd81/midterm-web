import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineUser } from "react-icons/ai"
function UserProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        userId: "",
        firstName: "",
        lastName: "",
        email: ""
    })
    useEffect(() => {
        async function getUserProfile() {
            let accessToken = localStorage.getItem("access_token");
            if (accessToken == null) {
                navigate("/login");
            }
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user`, {
                headers: { 'Authorization': "Bearer " + accessToken }
            })
            console.log(response.data);
            setUser(response.data);
        }
        getUserProfile()
    }, [])

    return (
        <div className="shadow-xl rounded-lg bg-slate-300 py-4 px-8">
            <div className="flex mb-8">
                <div className="border px-2 py-2 rounded-full w-fit bg-[#61dafb]"><AiOutlineUser size={40} /></div>
                <p className="ml-4 self-center font-bold text-xl">User Profile</p>
            </div>
            <div>
                <div className="flex py-4 px-8 border-b">
                    <span className="font-bold italic min-w-[200px]">UserId</span>
                    <div className="">{user.userId}</div>
                    <button className="ml-auto text-cyan-600">Edit</button>
                </div>
                <div className="flex py-4 px-8 border-b">
                    <span className="font-bold italic min-w-[200px]">FirstName</span>
                    <div>{user.firstName}</div>
                    <button className="ml-auto text-cyan-600">Edit</button>
                </div>
                <div className="flex py-4 px-8 border-b">
                    <span className="font-bold italic min-w-[200px]">LastName</span>
                    <div>{user.lastName}</div>
                    <button className="ml-auto text-cyan-600">Edit</button>
                </div>
                <div className="flex py-4 px-8 border-b">
                    <span className="font-bold italic min-w-[200px]">Email</span>
                    <div>{user.email}</div>
                    <button className="ml-auto text-cyan-600">Edit</button>
                </div>
            </div>
        </div>
    )
}

export default UserProfile;