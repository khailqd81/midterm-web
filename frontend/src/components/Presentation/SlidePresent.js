import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BarChart, Bar, LabelList, XAxis, ResponsiveContainer } from "recharts";

import ReactLoading from "react-loading";
import axios from "axios";
import { useSocket } from "../customHook/useSocket";
import landingImg from "../../landing-page-img.jpeg";
import { refreshAccessToken } from "../utils/auth";
import { toast, ToastContainer } from "react-toastify";
import MQABox from "./MQABox";
function SlidePresent() {
    const params = useParams();
    const { socketResponse } = useSocket(`present${params.presentId}`, "khai");
    const [role, setRole] = useState("member");
    const [isLogin, setIsLogin] = useState(false);

    // C
    const [chatList, setChatList] = useState([]);
    const [answerList, setAnswerList] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [slideDetail, setSlideDetail] = useState({
        slideId: "",
        heading: "",
        optionList: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [presentDetail, setPresentDetail] = useState({
        group: null,
        public: false,
    });
    const [groupDetail, setGroupDetail] = useState({
        groupName: "",
    });
    const [answer, setAnswer] = useState({
        optionName: "",
        optionId: "",
    });
    const navigate = useNavigate();
    //
    const [errorMessages, setErrorMessages] = useState("");

    useEffect(() => {
        async function checkAuth() {
            if (localStorage.getItem("access_token") === null) {
                setIsLogin(false);
                return;
            }
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/api/user/isauth`,
                    {
                        headers: {
                            Authorization:
                                "Bearer " +
                                localStorage.getItem("access_token"),
                        },
                    }
                );
                if (response.status === 200) {
                    localStorage.setItem("userId", response.data?.userId);
                    localStorage.setItem("email", response.data?.email);
                    localStorage.setItem("firstName", response.data?.firstName);
                    localStorage.setItem("lastName", response.data?.lastName);
                    setIsLogin(true);
                }
            } catch (error) {
                await refreshAccessToken();
                await checkAuth();
            }
        }
        checkAuth();
    }, []);

    function sortByDate(arraySort, isDesc) {
        console.log("arraySort", arraySort);
        let sortedData = null;
        if (isDesc) {
            sortedData = arraySort.sort((a, b) => b.createdAt - a.createdAt);
        } else {
            sortedData = arraySort.sort((a, b) => a.createdAt - b.createdAt);
        }
        let currentDay = new Date(sortedData[0].createdAt);
        console.log("createMessagesArray", currentDay);

        const stillCurrentDay = (dayOfItem) => {
            let dayCompare = new Date(dayOfItem);
            return (
                dayCompare.getFullYear() === currentDay.getFullYear() &&
                dayCompare.getMonth() === currentDay.getMonth() &&
                dayCompare.getDate() === currentDay.getDate()
            );
        };

        let dayMessageArray = [];
        const fullMessageArray = [];

        const createMessagesArray = (messages) => {
            const newDay = {};
            newDay[currentDay.toISOString().split("T")[0]] = messages;
            fullMessageArray.push(newDay);
        };

        sortedData.forEach((message) => {
            if (!stillCurrentDay(message.createdAt)) {
                createMessagesArray(dayMessageArray);
                currentDay = new Date(message.createdAt);
                dayMessageArray = [];
            }

            dayMessageArray.push(message);
        });
        createMessagesArray(dayMessageArray);

        console.log("sortedArray:", fullMessageArray);
        return fullMessageArray;
    }

    useEffect(() => {
        // Call api get chat list
        async function callApiGetChats(presentId, isPublic) {
            let response = null;
            try {
                if (isPublic) {
                    response = await axios.get(
                        `${process.env.REACT_APP_API_ENDPOINT}/api/chats/public/${presentId}/0`
                    );
                } else {
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
                }

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
        // Call api group information
        async function callApiSlideDetail() {
            const presentId = params.presentId;
            let response = null;
            let isPublic = false;
            try {
                response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/api/presents/vote/${presentId}`
                );
                isPublic = true;
            } catch (error) {
                // If presentation is not public then call with access token
                const accessToken = localStorage.getItem("access_token");
                try {
                    response = await axios.get(
                        `${process.env.REACT_APP_API_ENDPOINT}/api/presents/${presentId}/group`,
                        {
                            headers: { Authorization: "Bearer " + accessToken },
                        }
                    );
                } catch (error) {
                    setErrorMessages(
                        "You don't have permission to access this presentation"
                    );
                }
            } finally {
                // if (response.status !== 200) {
                //     setIsLoading(false);
                //     setErrorMessages(
                //         "You don't have permission to access this presentation"
                //     );
                // }
                if (response.status === 200) {
                    let present = response.data.presentation;
                    // if (!present.public) {
                    //     const group = response.data.group;
                    //     if (group !== null && group?.groupId !== null) {
                    //         // call api check user in group
                    //         const checkMember = await callApiIsMember(
                    //             group.groupId
                    //         );
                    //         setIsMember(Boolean(checkMember));
                    //         if (Boolean(checkMember)) {
                    //             await callApiGetChats();
                    //         }
                    //     }
                    // }
                    if (response.data.group) {
                        setGroupDetail(response.data.group);
                    }
                    await callApiGetChats(present.presentId, isPublic);
                    let newSlideDetail = present.currentSlide;
                    newSlideDetail.optionList.sort(
                        (a, b) => a.optionId - b.optionId
                    );
                    // let sortedAnswer = [...response.data.answerList];
                    // console.log("sortedAnswer", sortedAnswer);

                    // Check role for authority to view submit result
                    console.log("User role: ", response.data?.role);
                    if (response.data?.role) {
                        console.log("User role 2: ", response.data?.role);

                        setRole(response.data.role);
                        if (response.data.role !== "member") {
                            // let sortedAnswer = sortByDate([
                            //     ...response.data.answerList,
                            // ]);
                            setAnswerList(response.data.answerList);
                        } else {
                            setAnswerList([]);
                        }
                    } else {
                        // let sortedAnswer = sortByDate([
                        //     ...response.data.answerList,
                        // ]);
                        setAnswerList(response.data.answerList);
                    }
                    setPresentDetail(present);
                    setSlideDetail(newSlideDetail);
                }
                setIsLoading(false);
            }
        }
        // Get group info, do some validate
        async function getSlideDetail() {
            const presentId = params.presentId;

            if (presentId == null || presentId.trim().length <= 0) {
                return;
            }
            try {
                await callApiSlideDetail();
            } catch (error) {
                setIsLoading(false);
            }
        }
        getSlideDetail();
    }, [params.slideId, navigate, params.presentId]);

    useEffect(() => {
        console.log("slide presentent:", socketResponse);
        console.log("slide presentent id:", socketResponse.presentId);
        if (socketResponse.presentId) {
            if (
                socketResponse.public !== presentDetail.public ||
                socketResponse?.group?.groupId !== presentDetail?.group?.groupId
            ) {
                window.location.reload();
            }
            if (socketResponse.answerList) {
                setAnswerList(socketResponse.answerList);
            }
            setPresentDetail(socketResponse);
            let newSlideDetail = socketResponse.currentSlide;
            newSlideDetail?.optionList.sort((a, b) => a.optionId - b.optionId);
            setSlideDetail(newSlideDetail);
        } else if (socketResponse.chat) {
            toast.info("New message added", {
                autoClose: 3000,
                style: {
                    marginTop: "50px",
                },
            });
            setChatList((prev) => {
                let newChatList = [...prev];
                newChatList.unshift(socketResponse.chat);
                return newChatList;
            });
        }
    }, [socketResponse, presentDetail.public, presentDetail?.group?.groupId]);

    const onInputChange = (e, optionId) => {
        setAnswer({
            optionName: e.target.value,
            optionId: optionId,
        });
    };

    async function callApiIsMember(groupId) {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken === null || accessToken === undefined) {
            setIsLoading(false);
            return false;
        }
        const response = await axios.get(
            `${process.env.REACT_APP_API_ENDPOINT}/api/groups/${groupId}/isMember`,
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );

        let isMember = false;
        if (response.status === 200) {
            isMember = response.data.isMember;
        }
        setIsLoading(false);
    }

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        // console.log({
        //     slideId: slideDetail.slideId,
        //     option: answer
        // })
        // sendData({
        //     eventName: "send_vote",
        //     data: {
        //         slideId: slideDetail.slideId,
        //         option: answer,
        //         userId: localStorage.getItem("userId"),
        //     },
        // });
        try {
            await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/api/slides/vote/${slideDetail.slideId}`,
                {
                    optionId: answer.optionId,
                    userId: localStorage.getItem("userId"),
                }
            );
        } catch (error) {
            await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/api/slides/vote/${slideDetail.slideId}`,
                {
                    optionId: answer.optionId,
                    userId: localStorage.getItem("userId"),
                }
            );
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

    if (errorMessages.length > 1) {
        return (
            <div className="relative mx-auto max-w-[72vw] h-screen ">
                <div className="text-red-600 absolute z-10 w-[60%] text-center uppercase text-2xl left-1/2 top-[16%] bg-white border border-red-400 -translate-x-1/2 shadow-lg rounded-lg p-4">
                    You don't have permission to access this presentation
                </div>
                <img
                    src={landingImg}
                    className="absolute top-1/2 -translate-y-2/4 w-full shadow-lg rounded-lg"
                    alt="Slide presentation"
                />
            </div>
        );
    }

    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={false}
                theme="colored"
            />
            <header className="flex justify-between px-20 py-4 bg-[#333] ml-0">
                <ul className="flex text-white m-0 p-0">
                    <li className="mr-4">
                        <Link
                            to="/home"
                            className="no-underline text-[#61dafb]"
                        >
                            KahooPaTiKa
                        </Link>
                    </li>
                    <li className="mr-4">
                        <Link
                            to="/home"
                            className="no-underline text-white hover:text-[#61dafb]"
                        >
                            Home
                        </Link>
                    </li>
                    <li className="mr-4">
                        <Link
                            to="/home/presentation"
                            className="no-underline text-white hover:text-[#61dafb]"
                        >
                            Presentation
                        </Link>
                    </li>
                </ul>
                <ul className="flex text-white m-0 p-0">
                    <li className="mr-4">
                        <Link
                            to="/home/profile"
                            className="no-underline text-white hover:text-[#61dafb]"
                        >
                            Hello {localStorage.getItem("firstName")}
                        </Link>
                    </li>
                </ul>
            </header>
            <h1 className="font-bold text-6xl text-center mt-4 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-pink-500">
                KahooPaTiKa
            </h1>
            <div className="md:px-8 text-xl">
                {presentDetail.public ? (
                    <>
                        <span className="italic mr-2">Presenting:</span>
                        <span className="font-bold uppercase border shadow p-1 rounded-lg select-none">
                            Public
                        </span>
                    </>
                ) : (
                    <>
                        <span className="italic mr-2">
                            Presenting in group:
                        </span>
                        <span className="font-bold uppercase border shadow p-1 rounded-lg select-none">
                            {groupDetail?.groupName}
                        </span>
                    </>
                )}
            </div>
            <div className="flex justify-between flex-wrap flex-row md:px-8 md:py-10 md:pb-20 md:mx-4 p-2 h-[90vh]">
                {slideDetail.typeName === "multiple" && (
                    <>
                        <div className="basis-full md:basis-1/2 border w-full h-full bg-white shadow-xl rounded-lg">
                            <div className="mt-4 ml-4 mb-4 text-xl font-bold">
                                {slideDetail?.heading}
                            </div>
                            {slideDetail?.optionList.length > 0 && (
                                <div className="h-[400px]">
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={slideDetail?.optionList}
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
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                        <form
                            className="mt-4 md:mt-0 basis-full bg-white shadow-xl rounded-lg md:basis-2/5 h-full px-8 py-4"
                            onSubmit={(e) => handleSubmitForm(e)}
                        >
                            <div className="font-bold text-xl mb-4">
                                Select option:
                            </div>
                            <div className="overflow-y-auto max-h-[75%] shadow-2xl px-4 py-2">
                                {slideDetail?.optionList.length > 0 ? (
                                    slideDetail?.optionList.map((opt) => {
                                        return (
                                            <div
                                                className={
                                                    opt.optionName ===
                                                        answer.optionName &&
                                                    opt.optionId ===
                                                        answer.optionId
                                                        ? "flex border border-sky-400 border-2 rounded-lg my-2 pl-2 bg-white"
                                                        : "flex border hover:border-sky-400 border-2 shadow rounded-lg my-2 pl-2 bg-white"
                                                }
                                            >
                                                <input
                                                    className="outline-none"
                                                    id={opt.optionId}
                                                    name="option"
                                                    type="radio"
                                                    value={opt.optionName}
                                                    onChange={(e) =>
                                                        onInputChange(
                                                            e,
                                                            opt.optionId
                                                        )
                                                    }
                                                    checked={
                                                        opt.optionName ===
                                                            answer.optionName &&
                                                        opt.optionId ===
                                                            answer.optionId
                                                    }
                                                />
                                                <label
                                                    className="grow py-2 self-center ml-2 cursor-pointer"
                                                    htmlFor={opt.optionId}
                                                >
                                                    {opt.optionName}
                                                </label>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div></div>
                                )}
                            </div>

                            <button
                                className="mt-4 rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                                type="submit"
                            >
                                Submit
                            </button>
                        </form>
                    </>
                )}
                {slideDetail.typeName === "heading" && (
                    <div className="flex flex-col min-h-[50vh] justify-center border w-full h-full bg-white text-center">
                        <div className="mt-8 mx-auto mb-2 text-4xl font-bold  max-w-[60%] break-words break-all">
                            {slideDetail?.heading}
                        </div>
                        <div className="mt-2 mx-auto mb-4 text-xl max-w-[60%] break-words break-all">
                            {slideDetail?.subHeading}
                        </div>
                    </div>
                )}
                {slideDetail.typeName === "paragraph" && (
                    <div className="flex flex-col min-h-[50vh] justify-center border w-full h-full bg-white text-center">
                        <div className="mt-8 mx-auto mb-2 text-4xl font-bold  max-w-[60%] break-words break-all">
                            {slideDetail?.heading}
                        </div>
                        <div className="mt-2 mx-auto mb-4 text-xl max-w-[60%] break-words break-all">
                            {slideDetail?.paragraph}
                        </div>
                    </div>
                )}
            </div>

            <MQABox
                isLogin={isLogin}
                role={presentDetail.public ? "owner" : role}
                chatList={chatList}
                totalPage={totalPage}
                setChatList={setChatList}
                answerList={answerList}
                presentDetail={presentDetail}
            />
        </div>
    );
}
export default SlidePresent;
