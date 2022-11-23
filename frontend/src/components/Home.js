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
                setMemberGroup(memberGroups)
            }
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

    const handleGetListMember = async (groupId)  => {
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
            <div className="flex">
                <p>HOME PAGE</p>
                <button className="ml-10 hover:text-cyan-700" onClick={handleLogout}>Logout</button>
                <button className="ml-10 hover:text-cyan-700" onClick={handleLogout}>Profile</button>
            </div>

            <div>
                <input placeholder="Group name" value={groupName} onChange={e => setGroupName(e.target.value)} />
                <button onClick={handleCreateGroup}>Create group</button>
            </div>
            <div>
                <div>List group: </div>
                <div>Owner Group</div>
                <ul>
                    {ownerGroup.map(g => {
                        return <li className="border ml-4" key={g.groupId} onClick={() => handleGetListMember(g.groupId)}>Group name: {g.groupName}</li>
                    })}
                </ul>
                <div>Member Group</div>
                <ul>
                    {memberGroup.map(g => {
                        return <li className="border ml-4" key={g.groupId} onClick={() => handleGetListMember(g.groupId)}>Group name: {g.groupName}</li>
                    })}
                </ul>
            </div>

        </div>
    )
}

export default Home;