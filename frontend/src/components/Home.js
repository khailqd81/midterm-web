import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiUserGroup } from "react-icons/hi";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { BsFillCalendarCheckFill, BsFillTrashFill } from "react-icons/bs";
import { refreshAccessToken } from "./utils/auth";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "./customHook/useSocket";

function Home() {
    const navigate = useNavigate();
    const { socketResponse } = useSocket("public", "khai");
    const [groupName, setGroupName] = useState(""); // input groupName value
    const [ownerGroup, setOwnerGroup] = useState([]);
    const [memberGroup, setMemberGroup] = useState([]);
    const [refreshPage, setRefreshPage] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log(socketResponse);
        if (socketResponse?.room === "public") {
            const groupId = socketResponse.groupId;
            let group = ownerGroup.find((g) => g.groupId === groupId);
            if (group === undefined) {
                group = memberGroup.find((g) => g.groupId === groupId);
                if (group === undefined) {
                    return;
                }
            }
            const presentName = socketResponse.present.presentName;
            const groupName = socketResponse.groupName;
            toast.info(`Presenting ${presentName} in group ${groupName}`, {
                autoClose: false,
                style: {
                    marginTop: "50px",
                },
            });
        }
    }, [socketResponse, ownerGroup, memberGroup]);

    const callApiGetListGroup = async () => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.get(
            `${process.env.REACT_APP_API_ENDPOINT}/api/groups`,
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );

        if (response.status !== 200) {
            alert(response?.data?.message);
            return;
        }
        // Set owner groups
        if (response.data?.owner.length > 0) {
            setOwnerGroup(response.data?.owner);
        }

        // Set member groups
        let memberGroups = [];
        if (response.data?.coowner.length > 0) {
            memberGroups = response.data?.coowner;
        }
        if (response.data?.member.length > 0) {
            memberGroups = memberGroups.concat(response.data?.member);
        }
        setIsLoading(false);
        setMemberGroup(memberGroups);
    };

    async function getListGroup() {
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }

        try {
            await callApiGetListGroup();
            setIsLoading(false);
        } catch (error) {
            try {
                await refreshAccessToken();
                await callApiGetListGroup();
                setIsLoading(false);
            } catch (error) {
                navigate("/login");
            }
        }
    }

    useEffect(() => {
        getListGroup();
    }, [refreshPage, navigate]);

    const callApiCreateGroup = async () => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.post(
            `${process.env.REACT_APP_API_ENDPOINT}/api/groups`,
            {
                groupName: groupName,
            },
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );
        if (response.status === 200) {
            setGroupName("");
            setRefreshPage(!refreshPage);
        }
    };

    const handleCreateGroup = async (e) => {
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        // Validate input
        if (groupName == null || groupName.trim().length <= 0) {
            return;
        }
        try {
            e.target.disabled = true;
            await callApiCreateGroup();
            e.target.disabled = false;
        } catch (error) {
            try {
                await refreshAccessToken();
                await callApiCreateGroup();
            } catch (error) {
                navigate("/login");
            }
        } finally {
            e.target.disabled = false;
        }
    };

    const handleGetListMember = (groupId) => {
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
    };

    const callApiDeleteGroup = async (groupId) => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.delete(
            `${process.env.REACT_APP_API_ENDPOINT}/api/groups/${groupId}`,
            {
                headers: {
                    Authorization: "Bearer " + accessToken,
                },
            }
        );
        if (response.status === 200) {
            setOwnerGroup((prev) => {
                var newOwnerGroupList = prev.filter(
                    (p) => p.groupId !== groupId
                );
                return [...newOwnerGroupList];
            });
        }
    };

    const handleDeleteGroup = async (e, groupId) => {
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }

        try {
            e.target.disabled = true;
            await callApiDeleteGroup(groupId);
            e.target.disabled = false;
        } catch (error) {
            try {
                await refreshAccessToken();
            } catch (error2) {
                navigate("/login");
            }
            await callApiDeleteGroup(groupId);
        } finally {
            e.target.disabled = false;
        }
    };

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
        <div>
            {/* Create new Group */}
            <div className="mb-8">
                <div className="font-bold mb-2 font-bold text-2xl flex">
                    <AiOutlineUsergroupAdd
                        size={40}
                        color="#61dafb"
                        className="mr-4"
                    />
                    <span className="self-center">Create new group</span>
                </div>
                <input
                    className="outline-none px-4 py-2 border rounded mr-4 shadow-xl focus:border-cyan-300"
                    placeholder="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />
                {groupName.trim().length > 0 ? (
                    <button
                        className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                        onClick={(e) =>
                            toast.promise(
                                handleCreateGroup(e),
                                {
                                    pending: "Create new group",
                                    success: "Create new group success 👌",
                                    error: "Create new group failed  🤯",
                                },
                                {
                                    style: {
                                        marginTop: "50px",
                                    },
                                }
                            )
                        }
                    >
                        Create +
                    </button>
                ) : (
                    <button
                        disabled
                        className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl opacity-50"
                    >
                        Create +
                    </button>
                )}
            </div>
            {/* List Group */}
            <div>
                <div className="font-bold text-2xl flex">
                    <HiUserGroup size={40} className="text-[#61dafb] mr-4" />
                    <span className="self-center">Groups</span>
                </div>
                <div className="ml-2 font-bold text-xl">Groups you manage</div>
                <ul>
                    {ownerGroup.length > 0 ? (
                        ownerGroup.map((g) => {
                            return (
                                <li
                                    className="first:mt-4 border-b flex justify-between cursor-pointer  first:border-t"
                                    key={g.groupId}
                                >
                                    <div
                                        className="flex justify-between px-4 py-4 cursor-pointer grow hover:bg-slate-200"
                                        onClick={() =>
                                            handleGetListMember(g.groupId)
                                        }
                                    >
                                        <div>
                                            <span className="uppercase shadow-xl py-2 px-3 rounded-full mr-4 font-bold bg-[#61dafb]">
                                                {g.groupName[0]}
                                            </span>
                                            {g.groupName}
                                        </div>
                                        <div className="flex">
                                            <BsFillCalendarCheckFill
                                                className="self-center mr-2"
                                                size={20}
                                            />
                                            <span className="italic self-center mr-2">
                                                Created at:
                                            </span>{" "}
                                            {new Date(g.createdAt)
                                                .toString()
                                                .slice(0, 24)}
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <BsFillTrashFill
                                            onClick={(e) =>
                                                toast.promise(
                                                    handleDeleteGroup(
                                                        e,
                                                        g.groupId
                                                    ),
                                                    {
                                                        pending: "Delete Group",
                                                        success:
                                                            "Delete Group success 👌",
                                                        error: "Delete Group failed  🤯",
                                                    },
                                                    {
                                                        style: {
                                                            marginTop: "50px",
                                                        },
                                                    }
                                                )
                                            }
                                            className="self-center ml-4 hover:opacity-50"
                                            size={20}
                                        />
                                    </div>
                                </li>
                            );
                        })
                    ) : (
                        <div className="ml-4 text-cyan-500">
                            You have not created any groups yet
                        </div>
                    )}
                </ul>
                <div className="ml-2 font-bold text-xl">
                    Groups you have joined
                </div>
                <ul>
                    {memberGroup.length > 0 ? (
                        memberGroup.map((g) => {
                            return (
                                <li
                                    className="first:mt-4 border-b flex justify-between px-4 py-4 cursor-pointer hover:bg-slate-200 first:border-t"
                                    key={g.groupId}
                                    onClick={() =>
                                        handleGetListMember(g.groupId)
                                    }
                                >
                                    <div>
                                        <span className="uppercase shadow-xl py-2 px-3 rounded-full mr-4 font-bold bg-[#61dafb]">
                                            {g.groupName[0]}
                                        </span>
                                        {g.groupName}
                                    </div>
                                    <div className="flex">
                                        <BsFillCalendarCheckFill
                                            className="self-center mr-2"
                                            size={20}
                                        />
                                        <span className="italic mr-2">
                                            Created at:
                                        </span>{" "}
                                        {new Date(g.createdAt)
                                            .toString()
                                            .slice(0, 24)}
                                    </div>
                                </li>
                            );
                        })
                    ) : (
                        <div className="ml-4 text-cyan-500">
                            You have not joined any groups yet
                        </div>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default Home;
