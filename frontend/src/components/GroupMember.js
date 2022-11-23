import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function GroupMember() {
    const navigate = useNavigate();
    const params = useParams();
    const [groupMember, setgroupMember] = useState([])
    //const [groupId, setGroupId] = useState(null);
    console.log(params);
    useEffect(() => {
        async function getGroupMember() {
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
            if (response.status === 200) {
                console.log(response)
                setgroupMember(response.data.members)
            }
        }
        getGroupMember();
    }, [])


    return (
        <div>
            <div>Group member</div>
            <ul>
                {groupMember.map(m => {
                    return (<li key={m.user.userId}>{m.user.email} <span>{m.role}</span></li>)
                })}
            </ul>
            <button onClick={() => navigate("/home")}>Return home</button>
        </div>
    )
}

export default GroupMember;