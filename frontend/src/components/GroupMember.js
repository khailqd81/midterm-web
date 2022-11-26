import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function GroupMember() {
    const navigate = useNavigate();
    const params = useParams();
    const [inviteMail, setInviteMail] = useState("");
    const [isUpdateRole, setIsUpdateRole] = useState(false);
    const [showInviteBox, setShowInviteBox] = useState(false);
    const [groupInfo, setGroupInfo] = useState({
        groupId: "",
        createdAt: "",
        groupName: "",
        members: [],
        groupLink: ""
    })
    const [groupOwner, setGroupOwner] = useState({})
    //const [groupId, setGroupId] = useState(null);
    async function getGroupInfo() {
        const groupId = params.groupId;
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        if (groupId == null || groupId.trim().length <= 0) {
            return;
        }
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/groups/${groupId}`, {
            headers: { 'Authorization': "Bearer " + accessToken }
        })

        console.log("response: ", response)
        if (response.status === 200) {
            console.log(response.data.members.filter(m => m.role !== "owner"))
            setGroupInfo({
                ...response.data,
                members: response.data.members.filter(m => m.role !== "owner")
            })
            setGroupOwner(response.data.members.filter(m => m.role === "owner")[0].user)
        }
    }
    useEffect(() => {
        getGroupInfo();
    }, [params.groupId, navigate])

    const handleSendInviteLink = async () => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        if (inviteMail.length < 1) {
            return;
        }
        const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/groups/invite`, {
            memberEmail: inviteMail,
            groupId: groupInfo.groupId
        }, {
            headers: { 'Authorization': "Bearer " + accessToken }
        })
        console.log(response);

    }

    const handleRoleAssign = async (e, memberId, role) => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        console.log(memberId, role);
        e.target.disabled = true;
        const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/groups/member`, {
            userId: memberId,
            groupId: groupInfo.groupId,
            role: role
        }, {
            headers: { 'Authorization': "Bearer " + accessToken }
        })
        e.target.disabled = false;
        console.log("assign role: ", response.data);
    }
    return (
        <div>
            <div className="flex">
                <div>
                    <div className="font-bold text-2xl mb-4">
                        <span className="bg-[#61dafb] px-4 py-2 rounded-full uppercase mr-2">{groupInfo?.groupName[0]}</span>
                        <span className="italic">{groupInfo.groupName}</span>
                    </div>
                    <div className="italic mb-4">
                        <span className="font-bold">Created At:</span> {new Date(groupInfo.createdAt).toString().slice(0, 24)}
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
                                <p><span className="font-bold italic">Invite Link:</span> {`${process.env.REACT_APP_BASE_URL}/home/groups/join/${groupInfo.groupLink}`}</p>
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
            <div className="italic mb-4">
                <span className="font-bold">Owner By:</span> {groupOwner.lastName + " " + groupOwner.firstName}
                <span className="font-bold ml-4">Email:</span> {groupOwner.email}
            </div>
            <div className="flex mb-4">
                <input onChange={(e) => { setInviteMail(e.target.value) }} value={inviteMail} className="px-4 py-2 border rounded focus:border-cyan-300 outline-none shadow-2xl" placeholder="Member's email" />
                <button onClick={() => handleSendInviteLink()} className="ml-4 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]">Invite Member By Email</button>

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
                                    {m.user.userId === groupOwner.userId
                                        ?
                                        <>
                                            {
                                                m.role === "member"
                                                    ? <select
                                                        className="rounded-lg border px-2 py-1 capitalize outline-none rounded"
                                                        onChange={(e) => handleRoleAssign(e, m.user.userId, e.target.value)}
                                                    >
                                                        <option value={m.role}>{m.role}</option>
                                                        <option value="owner">Owner</option>
                                                        <option value="co-owner">Co-owner</option>
                                                        <option value="kick">Kick out</option>
                                                    </select>
                                                    : <select
                                                        className="rounded-lg border px-2 py-1 capitalize outline-none rounded"
                                                        onChange={(e) => handleRoleAssign(e, m.user.userId, e.target.value)}
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