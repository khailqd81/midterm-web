import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BsFillCalendarCheckFill } from "react-icons/bs";
import { FaUserAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { BiLinkAlt } from "react-icons/bi";
import { refreshAccessToken } from "../utils/auth";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { useSocket } from "../customHook/useSocket";
import { BarChart, Bar, LabelList, XAxis, ResponsiveContainer } from "recharts";
import MQABox from "../Presentation/MQABox";
export default function GroupInfo() {
    //const { socketResponse } = useSocket("public", "khai");
    const [role, setRole] = useState("member");
    const [isLogin, setIsLogin] = useState(false);
    const [chatList, setChatList] = useState([]);
    const [totalPage, setTotalPage] = useState(0);

    /* Component State */
    const [inviteMail, setInviteMail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    // Answer list
    const [answerList, setAnswerList] = useState([]);
    const [userRole, setUserRole] = useState("member");
    const [inviteMailMessage, setInviteMailMessage] = useState("");
    const [showInviteBox, setShowInviteBox] = useState(false);
    const [showSendMailResult, setShowSendMailResult] = useState(false);
    const [groupInfo, setGroupInfo] = useState({
        groupId: "",
        createdAt: "",
        groupName: "",
        members: [],
        groupLink: "",
        present: null,
    });
    const { socketResponse } = useSocket(`group${groupInfo.groupId}`, "khai");
    const [groupOwner, setGroupOwner] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    /**/
    const navigate = useNavigate();
    const params = useParams();
    useEffect(() => {
        console.log("Group Info socket: ", socketResponse);
        // If stop presenting
        if (
            socketResponse === null ||
            Object.keys(socketResponse).length === 0
        ) {
            setGroupInfo((prev) => {
                return {
                    ...prev,
                    present: null,
                };
            });
            return;
        }
        let newSlideDetail = socketResponse?.currentSlide;
        newSlideDetail?.optionList.sort((a, b) => a.optionId - b.optionId);
        // let userAnswer = socketResponse?.userAnswer;
        // if (userAnswer !== null && Object.keys(socketResponse).length > 0) {
        //     setAnswerList((prev) => {
        //         console.log("preList", prev);
        //         let newAnswerList = [];
        //         if (prev.length > 0) {
        //             newAnswerList = [...prev];
        //         }

        //         newAnswerList.unshift(userAnswer);
        //         return newAnswerList;
        //     });
        // }
        if (socketResponse.userAnswer) {
            setAnswerList((prev) => [...prev, socketResponse.userAnswer]);
        }

        if (socketResponse.answerList) {
            setAnswerList(socketResponse.answerList);
        }
        if (socketResponse.chatList) {
            setChatList(socketResponse.chatList);
        }
        if (socketResponse.chat) {
            setChatList((prev) => [...prev, socketResponse.chat]);
        }
        setGroupInfo((prev) => {
            return {
                ...prev,
                present: { ...socketResponse, currentSlide: newSlideDetail },
            };
        });
    }, [socketResponse]);

    // useEffect(() => {
    //     console.log(socketResponse);
    //     if (socketResponse?.room === "public") {
    //         const groupId = socketResponse.groupId;
    //         if (groupInfo.groupId !== groupId) {
    //             return;
    //         }
    //         const newPresent = socketResponse.present;
    //         setGroupInfo((prev) => {
    //             return {
    //                 ...prev,
    //                 present: { ...newPresent },
    //             };
    //         });
    //         toast.info(`Presenting ${newPresent.presentName} in group`, {
    //             autoClose: false,
    //             style: {
    //                 marginTop: "50px",
    //             },
    //         });
    //     }
    // }, [socketResponse, groupInfo.groupId]);

    // Toast success copied invite link
    const notifyCopy = () =>
        toast.success("Link copied", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "light",
        });

    // Call api group information
    async function callApiGroupInfo() {
        const groupId = params.groupId;
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get(
            `${process.env.REACT_APP_API_ENDPOINT}/api/groups/${groupId}`,
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );

        if (response.status === 200) {
            console.log(
                response.data.members.filter((m) => m.role !== "owner")
            );
            let index = response.data.members.findIndex(
                (m) =>
                    (m.role === "owner" || m.role === "co-owner") &&
                    m.user.userId.toString() ===
                        localStorage.getItem("userId").toString()
            );
            let present = response.data.present;
            if (response.data.role) {
                console.log("role: ", response.data.role);
                setRole(response.data.role);
            } else {
                setRole("member");
            }
            if (present !== null) {
                let newSlideDetail = present.currentSlide;
                await callApiGetChats(present.presentId);
                if (present.currentSlide !== null && index !== -1) {
                    let userAnswerResponse = await axios.get(
                        `${process.env.REACT_APP_API_ENDPOINT}/api/slides/${present.currentSlide.slideId}/answers`,
                        {
                            headers: { Authorization: "Bearer " + accessToken },
                        }
                    );
                    let answerList = userAnswerResponse.data.answerList;
                    // if (answerList !== null && answerList.length > 0) {
                    //     answerList.sort((a, b) => b.createdAt - a.createdAt);
                    // }
                    setAnswerList(answerList);
                }

                newSlideDetail?.optionList.sort(
                    (a, b) => a.optionId - b.optionId
                );
                present.currentSlide = newSlideDetail;
            }
            setGroupInfo({
                ...response.data,
                present,
                members: response.data.members.filter(
                    (m) => m.role !== "owner"
                ),
            });
            setGroupOwner(
                response.data.members.filter((m) => m.role === "owner")[0].user
            );
        }
        setIsLoading(false);
    }

    // Call api send invite mail
    async function callApiSendInviteMail() {
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.post(
            `${process.env.REACT_APP_API_ENDPOINT}/api/groups/invite`,
            {
                memberEmail: inviteMail,
                groupId: groupInfo.groupId,
            },
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );
        if (response.status === 200) {
            setInviteMailMessage("Send mail success");
            return Promise.resolve();
        }
        setInviteMailMessage(response.data.message);
    }

    async function callApiAssignRole(memberId, role) {
        const accessToken = localStorage.getItem("access_token");
        await axios.post(
            `${process.env.REACT_APP_API_ENDPOINT}/api/groups/member`,
            {
                userId: memberId,
                groupId: groupInfo.groupId,
                role: role,
            },
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );
    }

    // Get group info, do some validate
    async function getGroupInfo() {
        const groupId = params.groupId;
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/");
        }
        if (groupId == null || groupId.trim().length <= 0) {
            return;
        }
        try {
            await callApiGroupInfo();
        } catch (error) {
            try {
                await refreshAccessToken();
            } catch (error) {
                navigate("/");
            }
            await callApiGroupInfo();
        }
    }
    async function callApiGetChats(presentId) {
        let response = null;
        try {
            const accessToken = localStorage.getItem("access_token");
            if (accessToken === null || accessToken === undefined) {
                setIsLoading(false);
                return;
            }
            response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/api/chats/${presentId}/0`,
                {
                    headers: { Authorization: "Bearer " + accessToken },
                }
            );

            if (response !== null && response.status === 200) {
                console.log("chat list: ", response.data.chatList);
                setTotalPage(response.data.totalPage);
                setChatList(response.data.chatList);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        getGroupInfo();
    }, [params.groupId, navigate]);

    // On input mail invite change
    const onInviteMailChange = (e) => {
        setInviteMail(e.target.value);
        if (e.target.value.length < 1) {
            setErrorMessage("Email is required");
            return;
        }
        let pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        let result = pattern.test(e.target.value);
        if (!result) {
            setErrorMessage("Invali email format");
            return;
        }
        setErrorMessage("");
    };

    const handleSendInviteLink = async (e) => {
        // Do some validate
        const accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }

        if (inviteMail.length < 1) {
            setErrorMessage("Email is required");
            return Promise.reject();
        }
        let pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        let result = pattern.test(inviteMail);
        if (!result) {
            setErrorMessage("Invali email format");
            return Promise.reject();
        }

        try {
            e.target.disabled = true;
            await callApiSendInviteMail();
            e.target.disabled = false;
        } catch (error) {
            await refreshAccessToken();
            await callApiSendInviteMail();
            e.target.disabled = false;
        }
        //setShowSendMailResult(true);
    };

    const handleRoleAssign = async (e, memberId, role, oldRole) => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        if (role === "owner") {
            if (
                !window.confirm("Do you want to change the owner of the group?")
            ) {
                e.target.value = oldRole;
                return Promise.reject();
            }
        }
        if (role === "kick") {
            if (
                !window.confirm("Do you want to kick out member of the group?")
            ) {
                e.target.value = oldRole;
                return Promise.reject();
            }
        }
        try {
            e.target.disabled = true;
            await callApiAssignRole(memberId, role);
            e.target.disabled = false;
        } catch (error) {
            await refreshAccessToken();
            await callApiAssignRole(memberId, role);
        } finally {
            if (role === "owner" || role === "kick") {
                await getGroupInfo();
            }
            e.target.disabled = false;
        }
    };

    async function updateCurrentSlide(slideId) {
        console.log("slideId in groupInfo: ", slideId);
        if (slideId === null || slideId === undefined) {
            return;
        }
        try {
            const accessToken = localStorage.getItem("access_token");
            await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/api/presents/${groupInfo?.present?.presentId}/${slideId}`,
                {},
                {
                    headers: { Authorization: "Bearer " + accessToken },
                }
            );
        } catch (error) {
            console.log(error);
        }
    }

    const onChangeSlide = async (slideIndex, slideId) => {
        await updateCurrentSlide(slideId);
    };

    // userId of the current user
    const currentUserId = localStorage.getItem("userId");

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

    console.log("answerList", answerList);
    return (
        <div>
            <div className="flex">
                <div>
                    <div className="font-bold text-2xl mb-4">
                        <span className="bg-[#61dafb] px-4 py-2 rounded-full uppercase mr-2">
                            {groupInfo?.groupName[0]}
                        </span>
                        <span className="italic">{groupInfo.groupName}</span>
                    </div>
                    <div className="italic mb-4 flex pt-4">
                        <BsFillCalendarCheckFill
                            className="self-center mr-2"
                            size={25}
                        />
                        <span className="font-bold mr-2">Created At:</span>{" "}
                        {new Date(groupInfo.createdAt).toString().slice(0, 24)}
                    </div>
                </div>
                <div>
                    <button
                        onClick={() => setShowInviteBox(true)}
                        className="ml-8 mt-2 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]"
                    >
                        Create Invite Link
                    </button>
                    {showInviteBox && (
                        <>
                            <div className="fixed top-0 left-0 flex bg-slate-400 w-screen h-screen opacity-75"></div>
                            <div className="flex flex-col rounded-lg shadow-xl fixed top-1/2 left-1/2 -translate-y-2/4 -translate-x-1/2 bg-white px-4 py-10 opacity-100 z-1">
                                <div className="flex">
                                    <BiLinkAlt
                                        size={30}
                                        className="self-center mr-4"
                                    />
                                    <span className="font-bold italic">
                                        Invite Link:
                                    </span>{" "}
                                    {`${process.env.REACT_APP_BASE_URL}/home/groups/join/${groupInfo.groupLink}`}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                `${process.env.REACT_APP_BASE_URL}/home/groups/join/${groupInfo.groupLink}`
                                            );
                                            notifyCopy();
                                        }}
                                        className="mt-2 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        onClick={() => setShowInviteBox(false)}
                                        className="ml-4 mt-2 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="italic mb-4 flex">
                <div className="flex mr-8">
                    <FaUserAlt size={20} className="mr-2" />
                    <span className="font-bold mr-2">Owner By:</span>{" "}
                    {groupOwner.lastName + " " + groupOwner.firstName}
                </div>
                <div className="flex">
                    <MdEmail size={25} className="mr-2" />
                    <span className="font-bold mr-2">Email:</span>{" "}
                    {groupOwner.email}
                </div>
            </div>
            <div className="flex flex-col mb-4">
                <div className="flex">
                    <input
                        onChange={(e) => {
                            onInviteMailChange(e);
                        }}
                        value={inviteMail}
                        className="px-4 py-2 border rounded focus:border-cyan-300 outline-none shadow-2xl"
                        placeholder="Member's email"
                    />
                    <button
                        onClick={(e) =>
                            toast.promise(
                                async () => await handleSendInviteLink(e),
                                {
                                    pending: "Sending invite link",
                                    success: "Send invite link success 👌",
                                    error: "Send invite link failed  🤯",
                                },
                                {
                                    className: "mt-10",
                                }
                            )
                        }
                        className="ml-4 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb] disabled:hover:bg-[#61dafb] disabled:opacity-50"
                    >
                        Invite Member By Email
                    </button>
                    {showSendMailResult && (
                        <>
                            <div className="fixed top-0 left-0 flex bg-slate-400 w-screen h-screen opacity-75"></div>
                            <div className="flex flex-col rounded-lg shadow-xl fixed top-1/2 left-1/2 -translate-y-2/4 -translate-x-1/2 bg-white px-4 py-10 opacity-100 z-1">
                                <div className="flex">
                                    <MdEmail
                                        size={30}
                                        className="self-center mr-4"
                                    />
                                    <span className="font-bold italic">
                                        {inviteMailMessage}
                                    </span>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() =>
                                            setShowSendMailResult(false)
                                        }
                                        className="mt-2 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <p className="text-red-500 text-sm">{errorMessage}</p>
            </div>
            {groupInfo?.present !== null && (
                <div>
                    <div className="font-bold text-2xl mb-2">
                        Presenting Presentation
                    </div>
                    <div className="italic flex">
                        <div className="flex mr-8">
                            <FaUserAlt size={20} className="mr-2" />
                            <span className="font-bold mr-2">
                                Presentation:
                            </span>{" "}
                            {groupInfo.present?.presentName}
                        </div>
                        <div className="flex mr-8">
                            <FaUserAlt size={20} className="mr-2" />
                            <span className="font-bold mr-2">
                                Created By:
                            </span>{" "}
                            {groupInfo.present?.user?.firstName}
                        </div>
                    </div>
                    {/* <div className="mt-4 text-center border px-8 py-6 shadow-lg hover:shadow-xl hover:border-sky-400 cursor-pointer rounded-lg max-w-[10vw] uppercase">
                        {groupInfo.present?.currentSlide?.typeName}
                    </div> */}
                    <div className="flex flex-wrap flex-col justify-center my-4">
                        {(role === "owner" || role === "co-owner") && (
                            <div className="mb-8 flex flex-row flex-wrap">
                                {groupInfo?.present?.slideList.length > 0 &&
                                    groupInfo?.present?.slideList.map(
                                        (slide, index) => {
                                            return (
                                                <li
                                                    className="flex mr-2"
                                                    key={slide?.slideId}
                                                    onClick={(e) =>
                                                        onChangeSlide(
                                                            index,
                                                            slide?.slideId
                                                        )
                                                    }
                                                >
                                                    <div className="flex">
                                                        <p>{index + 1}</p>
                                                        <div className="flex flex-col justify-center bg-white border hover:border-black cursor-pointer h-24 w-40 rounded-lg shadow ml-2">
                                                            <p className="text-xs text-center">
                                                                {slide?.heading}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        }
                                    )}
                            </div>
                        )}

                        <div
                            className="flex flex-col pt-4 shadow-xl rounded-lg hover:shadow-2xl cursor-pointer mb-4"
                            onClick={() =>
                                navigate(
                                    `/home/presentation/${groupInfo.present?.presentId}/vote`
                                )
                            }
                        >
                            {groupInfo.present?.currentSlide?.typeName ===
                                "multiple" && (
                                <>
                                    <div className="font-bold ml-4">
                                        {
                                            groupInfo.present?.currentSlide
                                                ?.heading
                                        }
                                    </div>
                                    <BarChart
                                        cursor="pointer"
                                        width={740}
                                        height={250}
                                        data={
                                            groupInfo.present?.currentSlide
                                                ?.optionList
                                        }
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 20,
                                        }}
                                    >
                                        <XAxis dataKey="optionName" />
                                        <Bar dataKey="vote" fill="#8884d8">
                                            <LabelList
                                                dataKey="vote"
                                                position="top"
                                            />
                                        </Bar>
                                    </BarChart>
                                </>
                            )}
                            {groupInfo.present?.currentSlide?.typeName ===
                                "heading" && (
                                <>
                                    <div className="font-bold px-10 pt-4 pb-2 text-center">
                                        {
                                            groupInfo.present?.currentSlide
                                                ?.heading
                                        }
                                    </div>
                                    <div className="font-bold px-10 pb-8 text-center">
                                        {
                                            groupInfo.present?.currentSlide
                                                ?.subHeading
                                        }
                                    </div>
                                </>
                            )}
                            {groupInfo.present?.currentSlide?.typeName ===
                                "paragraph" && (
                                <>
                                    <div className="font-bold px-10 pt-4 pb-2 text-center">
                                        {
                                            groupInfo.present?.currentSlide
                                                ?.heading
                                        }
                                    </div>
                                    <div className="font-bold px-10 pb-8 text-center">
                                        {
                                            groupInfo.present?.currentSlide
                                                ?.paragraph
                                        }
                                    </div>
                                </>
                            )}
                        </div>
                        <MQABox
                            isLogin={true}
                            role={role}
                            chatList={chatList}
                            totalPage={totalPage}
                            setChatList={setChatList}
                            answerList={answerList}
                            presentDetail={groupInfo.present}
                        />
                        {/* {answerList !== null && answerList.length > 0 && (
                            <ul className="ml-4 max-h-[200px] overflow-y-scroll ">
                                <span className="font-bold">Answer list:</span>

                                {answerList &&
                                    answerList.map((an) => {
                                        return (
                                            <li
                                                key={an.answerId}
                                                className="flex justify-between border px-4 py-1 shadow my-1 rounded-lg italic"
                                            >
                                                <span>
                                                    {an.option.optionName}
                                                </span>
                                                <span className="mx-2">
                                                    {an.user.firstName}
                                                </span>
                                                <span>
                                                    {new Date(
                                                        an.createdAt
                                                    ).toLocaleString()}
                                                </span>
                                            </li>
                                        );
                                    })}
                            </ul>
                        )} */}
                    </div>
                </div>
            )}
            <div className="font-bold text-2xl mb-2">Group member</div>
            <table className="w-full shadow-xl px-4 py-4">
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
                    {groupInfo?.members.length > 0 &&
                        groupInfo.members.map((m, index) => {
                            return (
                                <tr
                                    key={m.user.userId}
                                    className="text-left border-b"
                                >
                                    <td className="px-4 py-4">{index + 1}</td>
                                    <td className=" py-4">
                                        {m.user.firstName}
                                    </td>
                                    <td className=" py-4">{m.user.lastName}</td>
                                    <td className=" py-4">{m.user.email}</td>
                                    <td className=" py-4">
                                        {groupOwner.userId.toString() ===
                                        currentUserId.toString() ? (
                                            <>
                                                {m.role === "member" ? (
                                                    <select
                                                        className="rounded-lg border px-2 py-1 capitalize outline-none rounded"
                                                        onChange={(e) =>
                                                            toast.promise(
                                                                handleRoleAssign(
                                                                    e,
                                                                    m.user
                                                                        .userId,
                                                                    e.target
                                                                        .value,
                                                                    m.role
                                                                ),
                                                                {
                                                                    pending:
                                                                        "Assigning new role",
                                                                    success:
                                                                        "Assign new role success 👌",
                                                                    error: "Assign new role failed  🤯",
                                                                },
                                                                {
                                                                    className:
                                                                        "mt-10",
                                                                }
                                                            )
                                                        }
                                                    >
                                                        <option value={m.role}>
                                                            {m.role}
                                                        </option>

                                                        <option value="co-owner">
                                                            Co-owner
                                                        </option>
                                                        <option value="kick">
                                                            Kick out
                                                        </option>
                                                    </select>
                                                ) : (
                                                    <select
                                                        className="rounded-lg border px-2 py-1 capitalize outline-none rounded"
                                                        onChange={(e) =>
                                                            toast.promise(
                                                                handleRoleAssign(
                                                                    e,
                                                                    m.user
                                                                        .userId,
                                                                    e.target
                                                                        .value,
                                                                    m.role
                                                                ),
                                                                {
                                                                    pending:
                                                                        "Assigning new role",
                                                                    success:
                                                                        "Assign new role success 👌",
                                                                    error: "Assign new role failed  🤯",
                                                                },
                                                                {
                                                                    className:
                                                                        "mt-10",
                                                                }
                                                            )
                                                        }
                                                    >
                                                        <option value={m.role}>
                                                            {m.role}
                                                        </option>

                                                        <option value="co-owner">
                                                            Member
                                                        </option>
                                                        <option value="kick">
                                                            Kick out
                                                        </option>
                                                    </select>
                                                )}
                                            </>
                                        ) : (
                                            <div className="px-2 py-1 capitalize outline-none">
                                                {m.role}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
            <button
                onClick={() => navigate("/home")}
                className="mt-4 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]"
            >
                Return home
            </button>
        </div>
    );
}
