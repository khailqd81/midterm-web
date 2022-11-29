import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BsFillCalendarCheckFill } from "react-icons/bs"
import { FaUserAlt } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import { BiLinkAlt } from "react-icons/bi"
import {refreshAccessToken} from "./utils/auth"
function GroupMember() {
    const [inviteMail, setInviteMail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [inviteMailMessage, setInviteMailMessage] = useState("");
    //const [isUpdateRole, setIsUpdateRole] = useState(false);
    const [showInviteBox, setShowInviteBox] = useState(false);
    const [showSendMailResult, setShowSendMailResult] = useState(false);
    const [groupInfo, setGroupInfo] = useState({
        groupId: "",
        createdAt: "",
        groupName: "",
        members: [],
        groupLink: "",
    })
    const [groupOwner, setGroupOwner] = useState({})
    const navigate = useNavigate();
    const params = useParams();

    // Get group information
    async function getGroupInfo() {
        const groupId = params.groupId;
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        if (groupId == null || groupId.trim().length <= 0) {
            return;
        }
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/groups/${groupId}`, {
                headers: { 'Authorization': "Bearer " + accessToken }
            })
    
            if (response.status === 200) {
                console.log(response.data.members.filter(m => m.role !== "owner"))
                setGroupInfo({
                    ...response.data,
                    members: response.data.members.filter(m => m.role !== "owner")
                })
                setGroupOwner(response.data.members.filter(m => m.role === "owner")[0].user)
            }
        } catch (error) {
            try {
                let check = await refreshAccessToken();
                if (check) {
                    await getGroupInfo();
                }
            } catch (error) {
                navigate("/login")
            }
        }
    }

    useEffect(() => {
        getGroupInfo();
    }, [params.groupId, navigate])

    const onInviteMailChange = (e) => {
        setInviteMail(e.target.value)
        if (e.target.value.length < 1) {
            setErrorMessage("Email is required")
            return;
        }
        let pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        let result = pattern.test(e.target.value);
        if (!result) {
            setErrorMessage("Invali email format")
            return
        }
        setErrorMessage("")

    }

    const handleSendInviteLink = async (e) => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }

        if (inviteMail.length < 1) {
            setErrorMessage("Email is required")
            return;
        }
        let pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        let result = pattern.test(inviteMail);
        if (!result) {
            setErrorMessage("Invali email format")
        }

        e.target.disabled = true;
        const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/groups/invite`, {
            memberEmail: inviteMail,
            groupId: groupInfo.groupId
        }, {
            headers: { 'Authorization': "Bearer " + accessToken }
        })
        e.target.disabled = false;

        setShowSendMailResult(true);
        if (response.status === 200) {
            setInviteMailMessage("Send mail success")
            return;
        }
        setInviteMailMessage(response.data.message);

    }

    const handleRoleAssign = async (e, memberId, role, oldRole) => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        if (role === "owner") {
            if (!window.confirm("Do you want to change the owner of the group?")) {
                e.target.value = oldRole;
                return
            }
        }
        if (role === "kick") {
            if (!window.confirm("Do you want to kick out member of the group?")) {
                e.target.value = oldRole;
                return
            }
        }
        e.target.disabled = true;
        const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/groups/member`, {
            userId: memberId,
            groupId: groupInfo.groupId,
            role: role
        }, {
            headers: { 'Authorization': "Bearer " + accessToken }
        })
        if (response.status === 200) {
            alert("Assign new role success")
        }
        if (role === "owner" || role === "kick") {
            await getGroupInfo();
        }
        e.target.disabled = false;
    }

    // userId of the current user
    const currentUserId = localStorage.getItem("userId");

    return (
        <div>
            <div className="flex">
                <div>
                    <div className="font-bold text-2xl mb-4">
                        <span className="bg-[#61dafb] px-4 py-2 rounded-full uppercase mr-2">{groupInfo?.groupName[0]}</span>
                        <span className="italic">{groupInfo.groupName}</span>
                    </div>
                    <div className="italic mb-4 flex pt-4">
                        <BsFillCalendarCheckFill className="self-center mr-2" size={25} />
                        <span className="font-bold mr-2">Created At:</span> {new Date(groupInfo.createdAt).toString().slice(0, 24)}
                    </div>
                </div>
                <div>
                    <button onClick={() => setShowInviteBox(true)} className="ml-8 mt-2 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]">Create Invite Link</button>
                    {
                        showInviteBox &&
                        <>
                            <div className="fixed top-0 left-0 flex bg-slate-400 w-screen h-screen opacity-75">

                            </div>
                            <div className="flex flex-col rounded-lg shadow-xl fixed top-1/2 left-1/2 -translate-y-2/4 -translate-x-1/2 bg-white px-4 py-10 opacity-100 z-1">
                                <div className="flex">
                                    <BiLinkAlt size={30} className="self-center mr-4" />
                                    <span className="font-bold italic">Invite Link:</span> {`${process.env.REACT_APP_BASE_URL}/home/groups/join/${groupInfo.groupLink}`}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(`${process.env.REACT_APP_BASE_URL}/home/groups/join/${groupInfo.groupLink}`)}
                                        className="mt-2 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]">
                                        Copy
                                    </button>
                                    <button
                                        onClick={() => setShowInviteBox(false)}
                                        className="ml-4 mt-2 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]">
                                        Done
                                    </button>
                                </div>
                            </div>
                        </>
                    }

                </div>
            </div>
            <div className="italic mb-4 flex">
                <div className="flex mr-8">
                    <FaUserAlt size={20} className="mr-2" />
                    <span className="font-bold mr-2">Owner By:</span> {groupOwner.lastName + " " + groupOwner.firstName}
                </div>
                <div className="flex">
                    <MdEmail size={25} className="mr-2" />
                    <span className="font-bold mr-2">Email:</span> {groupOwner.email}
                </div>
            </div>
            <div className="flex flex-col mb-4">
                <div className="flex">
                    <input onChange={(e) => { onInviteMailChange(e) }} value={inviteMail} className="px-4 py-2 border rounded focus:border-cyan-300 outline-none shadow-2xl" placeholder="Member's email" />
                    <button onClick={(e) => handleSendInviteLink(e)} className="ml-4 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb] disabled:hover:bg-[#61dafb] disabled:opacity-50">Invite Member By Email</button>
                    {showSendMailResult &&
                        <>
                            <div className="fixed top-0 left-0 flex bg-slate-400 w-screen h-screen opacity-75">
                            </div>
                            <div className="flex flex-col rounded-lg shadow-xl fixed top-1/2 left-1/2 -translate-y-2/4 -translate-x-1/2 bg-white px-4 py-10 opacity-100 z-1">
                                <div className="flex">
                                    <MdEmail size={30} className="self-center mr-4" />
                                    <span className="font-bold italic">{inviteMailMessage}</span>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowSendMailResult(false)}
                                        className="mt-2 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]">
                                        OK
                                    </button>
                                </div>
                            </div>
                        </>}
                </div>
                <p className="text-red-500 text-sm">{errorMessage}</p>
            </div>

            <div className="font-bold text-2xl mb-2">Group member</div>
            <table className="w-full shadow-xl px-4 py-2">
                <thead>
                    <tr className="uppercase text-left border-b">
                        <th className="px-4 py-2">Index</th>
                        <th>Firstname</th>
                        <th>Lastname</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {groupInfo?.members.length > 0 && groupInfo.members.map((m, index) => {
                        return (
                            <tr key={m.user.userId} className="text-left border-b">
                                <td className="px-4 py-4">{index + 1}</td>
                                <td className=" py-4">{m.user.firstName}</td>
                                <td className=" py-4">{m.user.lastName}</td>
                                <td className=" py-4">{m.user.email}</td>
                                <td className=" py-4">
                                    {groupOwner.userId.toString() === currentUserId.toString()
                                        ?
                                        <>
                                            {
                                                m.role === "member"
                                                    ? <select
                                                        className="rounded-lg border px-2 py-1 capitalize outline-none rounded"
                                                        onChange={(e) => handleRoleAssign(e, m.user.userId, e.target.value, m.role)}
                                                    >
                                                        <option value={m.role}>{m.role}</option>
                                                        <option value="owner">Owner</option>
                                                        <option value="co-owner">Co-owner</option>
                                                        <option value="kick">Kick out</option>
                                                    </select>
                                                    : <select
                                                        className="rounded-lg border px-2 py-1 capitalize outline-none rounded"
                                                        onChange={(e) => handleRoleAssign(e, m.user.userId, e.target.value, m.role)}
                                                    >
                                                        <option value={m.role}>{m.role}</option>
                                                        <option value="owner">Owner</option>
                                                        <option value="co-owner">Member</option>
                                                        <option value="kick">Kick out</option>
                                                    </select>
                                            }
                                        </>
                                        : <div className="px-2 py-1 capitalize outline-none">{m.role}</div>
                                    }

                                </td>
                            </tr>
                        )
                    })}
                </tbody>

            </table>
            <button onClick={() => navigate("/home")} className="mt-4 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]">Return home</button>
        </div>
    )
}

export default GroupMember;