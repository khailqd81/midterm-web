import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState("");
    const [ownerGroup, setOwnerGroup] = useState([]);
    const [memberGroup, setMemberGroup] = useState([]);
    const [refreshPage, setRefreshPage] = useState(true);
    useEffect(() => {
        async function getListGroup() {
            let accessToken = localStorage.getItem("access_token");
            if (accessToken == null) {
                navigate("/login");
            }
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/groups`, {
                headers: { 'Authorization': "Bearer " + accessToken }
            })
            if (response.status !== 200) {
                return;
            }
            if (response.data?.owner.length > 0) {
                setOwnerGroup(response.data?.owner)
            }
            let memberGroups = []
            if (response.data?.coowner.length > 0) {
                memberGroups = response.data?.coowner;
            }
            if (response.data?.member.length > 0) {
                memberGroups.concat(response.data?.member);
            }
            setMemberGroup(memberGroups)
        }
        getListGroup();
    }, [refreshPage])

    const handleLogout = () => {
        if (localStorage.getItem("access_token") != null) {
            localStorage.removeItem("access_token");
        }
        navigate("/login")
    }

    const handleCreateGroup = async () => {
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        if (groupName == null || groupName.trim().length <= 0) {
            return;
        }
        const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/groups`, {
            groupName: groupName
        }, {
            headers: { 'Authorization': "Bearer " + accessToken }
        })
        if (response.status === 200) {
            setGroupName("");
            setRefreshPage(!refreshPage);
        }
    }

    const handleGetListMember = async (groupId) => {
        console.log(groupId);
        navigate(`/home/groups/${groupId}`);
        // let accessToken = localStorage.getItem("access_token");
        // if (accessToken == null) {
        //     navigate("/login");
        // }
        // if (groupId == null || groupId.trim().length <= 0) {
        //     return;
        // }
        // const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/groups/${groupId}`, {
        //     headers: { 'Authorization': "Bearer " + accessToken }
        // })
        // if (response.status === 200) {
        //     navigate()
        // }
        // console.log(groupId);
    }
    return (
        <div>
            {/* <div className="flex">
                <p>HOME PAGE</p>
                <button className="ml-10 hover:text-cyan-700" onClick={handleLogout}>Logout</button>
                <button className="ml-10 hover:text-cyan-700" onClick={handleLogout}>Profile</button>
            </div> */}

            <div className="mb-8">
                <p className="font-bold mb-2 font-bold text-2xl">Create new group: </p>
                <input className="outline-none px-4 py-2 border rounded mr-4 shadow-xl" placeholder="Group name" value={groupName} onChange={e => setGroupName(e.target.value)} />
                <button className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2]" onClick={handleCreateGroup}>Create +</button>
            </div>
            <div>
                <div className="font-bold text-2xl">Groups: </div>
                <div className="ml-2 font-bold text-xl">Groups you manage</div>
                <ul>
                    {ownerGroup.length > 0
                        ?
                        ownerGroup.map(g => {
                            return (
                                <li className="first:mt-4 border-b flex justify-between px-4 py-4 cursor-pointer hover:bg-slate-200 first:border-t" key={g.groupId} onClick={() => handleGetListMember(g.groupId)}>
                                    <div>
                                        <span className="uppercase shadow-xl py-2 px-3 rounded-full mr-4 font-bold bg-[#61dafb]">{g.groupName[0]}</span>
                                        {g.groupName}
                                    </div>
                                    <div><span className="italic">Created at:</span> {new Date(g.createdAt).toString().slice(0, 24)}</div>
                                </li>
                            )
                        })
                        : <div className="ml-4 text-cyan-500">You have not created any groups yet</div>
                    }
                </ul>
                <div className="ml-2 font-bold text-xl">Groups you have joined</div>
                <ul>
                    {memberGroup.length > 0
                        ?
                        memberGroup.map(g => {
                            return (
                                <li className="first:mt-4 border-b flex justify-between px-4 py-4 cursor-pointer hover:bg-slate-200 first:border-t" key={g.groupId} onClick={() => handleGetListMember(g.groupId)}>
                                    <div>
                                        <span className="uppercase shadow-xl py-2 px-3 rounded-full mr-4 font-bold bg-[#61dafb]">{g.groupName[0]}</span>
                                        {g.groupName}
                                    </div>
                                    <div><span className="italic">Created at:</span> {new Date(g.createdAt).toString().slice(0, 24)}</div>
                                </li>
                            )
                        })
                        : <div className="ml-4 text-cyan-500">You have not joined any groups yet</div>
                    }

                </ul>
            </div>

        </div>
    )
}

export default Home;