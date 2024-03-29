import { useEffect, useState } from "react";
import { HiUserGroup } from "react-icons/hi";
import { BsFillCalendarCheckFill, BsFillTrashFill } from "react-icons/bs";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";
import { refreshAccessToken } from "../utils/auth";
import ReactLoading from "react-loading";
import { useNavigate } from "react-router-dom";
function Presentation() {
    //const [slideQuestion, setSlideQuestion] = useState('Multiple choice');
    const [presentName, setPresentName] = useState("");

    const [presenList, setPresenList] = useState([]);
    const [coPresenList, setCoPresenList] = useState([]);
    const [refreshPage, setRefreshPage] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const callApiGetListPresent = async () => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.get(
            `${process.env.REACT_APP_API_ENDPOINT}/api/presents`,
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );

        if (response.status !== 200) {
            alert(response?.data?.message);
            return;
        }

        // Set presentation list
        if (
            response.data?.presentationList.length > 0 ||
            response.data?.coPresentationList.length > 0
        ) {
            setPresenList(response.data?.presentationList);
            setCoPresenList(response.data?.coPresentationList);
        }

        setIsLoading(false);
    };

    async function getListPresent() {
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }

        try {
            await callApiGetListPresent();
            setIsLoading(false);
        } catch (error) {
            try {
                await refreshAccessToken();
            } catch (error) {
                navigate("/login");
            }
            await callApiGetListPresent();
            setIsLoading(false);
        }
    }
    useEffect(() => {
        getListPresent();
    }, [refreshPage]);

    const callApiCreatePresent = async () => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.post(
            `${process.env.REACT_APP_API_ENDPOINT}/api/presents`,
            {
                presentName: presentName,
            },
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );
        if (response.status === 200) {
            setPresentName("");
            setRefreshPage(!refreshPage);
        }
    };

    const handleCreatePresent = async (e) => {
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        // Validate input
        if (presentName == null || presentName.trim().length <= 0) {
            return;
        }
        try {
            e.target.disabled = true;
            console.log("Present:", presentName);
            await callApiCreatePresent();
            e.target.disabled = false;
        } catch (error) {
            try {
                await refreshAccessToken();
                await callApiCreatePresent();
            } catch (error) {
                navigate("/login");
            }
        } finally {
            e.target.disabled = false;
        }
    };
    const handleGetPresentDetail = (presentId) => {
        navigate(`/home/presentation/${presentId}`);
    };

    const callApiDeletePresent = async (presentId) => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.delete(
            `${process.env.REACT_APP_API_ENDPOINT}/api/presents/${presentId}`,
            {
                headers: {
                    Authorization: "Bearer " + accessToken,
                },
            }
        );
        if (response.status === 200) {
            setPresenList((prev) => {
                var newPresentList = prev.filter(
                    (p) => p.presentId !== presentId
                );
                console.log(newPresentList);
                return [...newPresentList];
            });
        }
    };

    const handleDeletePresent = async (e, presentId) => {
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }

        try {
            e.target.disabled = true;
            await callApiDeletePresent(presentId);
            e.target.disabled = false;
        } catch (error) {
            try {
                await refreshAccessToken();
            } catch (error2) {
                navigate("/login");
            }
            await callApiDeletePresent(presentId);
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
        <div className="mb-8">
            <div className="mb-8">
                <div className="font-bold mb-2 font-bold text-2xl flex">
                    <AiOutlineUsergroupAdd
                        size={40}
                        color="#61dafb"
                        className="mr-4"
                    />
                    <span className="self-center">Create new Presentation</span>
                </div>
                <input
                    className="outline-none px-4 py-2 border rounded mr-4 shadow-xl focus:border-cyan-300"
                    placeholder="Presentation name"
                    value={presentName}
                    onChange={(e) => setPresentName(e.target.value)}
                />
                {presentName.trim().length > 0 ? (
                    <button
                        className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                        onClick={(e) =>
                            toast.promise(
                                handleCreatePresent(e),
                                {
                                    pending: "Create new Presentation",
                                    success:
                                        "Create new Presentation success 👌",
                                    error: "Create new Presentation failed  🤯",
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

            <div>
                <div className="font-bold text-2xl flex">
                    <HiUserGroup size={40} className="text-[#61dafb] mr-4" />
                    <span className="self-center">Presentations</span>
                </div>
                <ul>
                    {presenList.length > 0 ? (
                        presenList
                            .sort((a, b) => a.presentId - b.presentId)
                            .map((g) => {
                                return (
                                    <li
                                        className="first:mt-4 border-b flex justify-between cursor-pointer  first:border-t"
                                        key={g.presentId}
                                    >
                                        <div
                                            className="flex justify-between px-4 py-4 cursor-pointer grow hover:bg-slate-200"
                                            onClick={() =>
                                                handleGetPresentDetail(
                                                    g.presentId
                                                )
                                            }
                                        >
                                            <div>
                                                <span className="uppercase shadow-xl py-2 px-3 rounded-full mr-4 font-bold bg-[#61dafb]">
                                                    {g.presentName[0]}
                                                </span>
                                                {g.presentName}
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
                                                        handleDeletePresent(
                                                            e,
                                                            g.presentId
                                                        ),
                                                        {
                                                            pending:
                                                                "Delete Presentation",
                                                            success:
                                                                "Delete Presentation success 👌",
                                                            error: "Delete Presentation failed  🤯",
                                                        },
                                                        {
                                                            style: {
                                                                marginTop:
                                                                    "50px",
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
                            You have not created any presentation yet
                        </div>
                    )}
                </ul>
                <div className="font-bold text-2xl flex">
                    <HiUserGroup size={40} className="text-[#61dafb] mr-4" />
                    <span className="self-center">
                        Presentations Collaborate
                    </span>
                </div>
                <ul>
                    {coPresenList.length > 0 ? (
                        coPresenList.map((g) => {
                            return (
                                <li
                                    className="first:mt-4 border-b flex justify-between cursor-pointer  first:border-t"
                                    key={g.presentId}
                                >
                                    <div
                                        className="flex justify-between px-4 py-4 cursor-pointer grow hover:bg-slate-200"
                                        onClick={() =>
                                            handleGetPresentDetail(g.presentId)
                                        }
                                    >
                                        <div>
                                            <span className="uppercase shadow-xl py-2 px-3 rounded-full mr-4 font-bold bg-[#61dafb]">
                                                {g.presentName[0]}
                                            </span>
                                            {g.presentName}
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
                                </li>
                            );
                        })
                    ) : (
                        <div className="ml-4 text-cyan-500">
                            You have not created any presentation yet
                        </div>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default Presentation;
