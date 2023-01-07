import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BarChart, Bar, LabelList, XAxis, ResponsiveContainer } from "recharts";
import { BsFillChatFill, BsFillQuestionCircleFill } from "react-icons/bs";
import { RiSurveyFill } from "react-icons/ri";
import ReactLoading from "react-loading";
import axios from "axios";
import { useSocket } from "../customHook/useSocket";
import landingImg from "../../landing-page-img.jpeg";
import { refreshAccessToken } from "../utils/auth";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast, ToastContainer } from "react-toastify";

function SlidePresent() {
    const params = useParams();
    const { socketResponse } = useSocket(`present${params.presentId}`, "khai");
    const [isLogin, setIsLogin] = useState(false);
    const [showBox, setShowBox] = useState("");
    const [chatList, setChatList] = useState([]);
    const [answerList, setAnswerList] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [totalPage, setTotalPage] = useState(0);
    const [isNotify, setIsNotify] = useState(true);
    // Input question and message
    const [chat, setChat] = useState("");
    const [question, setQuestion] = useState("");
    //
    const [errorMessages, setErrorMessages] = useState("");
    const [page, setPage] = useState(0);

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

    //

    // const room = "public";
    // const username = "khai";
    // const [socket, setSocket] = useState();
    // const [socketResponse, setSocketResponse] = useState({
    //     room: "",
    //     username: "",
    //     option: "",
    //     slideId: ""
    //     // messageType: "",
    //     // createdDateTime: "",
    // });
    // const [isConnected, setIsConnected] = useState(false);

    // const sendData = useCallback(
    //     (payload) => {
    //         if (payload.message === "send_update") {
    //             //console.log(payload.slide)
    //             socket.emit("send_update", {
    //                 room: room,
    //                 username: username,
    //                 slide: payload.slide
    //                 //messageType: "CLIENT",
    //             });
    //         } else {
    //             socket.emit("send_vote", {
    //                 room: room,
    //                 username: username,
    //                 option: payload.option,
    //                 slideId: payload.slideId
    //                 //messageType: "CLIENT",
    //             });
    //         }

    //     },
    //     [socket, room]
    // );

    // useEffect(() => {
    //     // console.log(`${process.env.REACT_APP_API_ENDPOINT}`)

    //     const s = io("http://localhost:8085", {
    //         reconnection: false,
    //         query: `username=${username}&room=${room}`, //"room=" + room+",username="+username,
    //     });

    //     s.on("connect", () => {
    //         console.log("connect from SlidePresent success")
    //         setIsConnected(true)
    //     }
    //     );
    //     setSocket(s);

    //     s.on("read_message", (res) => {
    //         console.log("res in slide Present:", res);
    //         setSocketResponse({
    //             room: res.room,
    //             username: res.username,
    //             slide: res?.slide,
    //             option: res?.option,
    //             slideId: res?.slideId
    //             // content: res.content,
    //             // messageType: res.messageType,
    //             // createdDateTime: res.createdDateTime,
    //         });
    //     });

    //     return () => {
    //         console.log("disconnect")
    //         s.disconnect();
    //     };

    // }, [room]);

    //

    const [slideDetail, setSlideDetail] = useState({
        slideId: "",
        heading: "",
        optionList: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    // const [isPublic, setIsPublic] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [presentDetail, setPresentDetail] = useState({
        group: null,
        public: false,
    });
    const [answer, setAnswer] = useState({
        optionName: "",
        optionId: "",
    });
    const navigate = useNavigate();

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
                    await callApiGetChats(present.presentId, isPublic);
                    let newSlideDetail = present.currentSlide;
                    newSlideDetail.optionList.sort(
                        (a, b) => a.optionId - b.optionId
                    );
                    // let sortedAnswer = [...response.data.answerList];
                    // console.log("sortedAnswer", sortedAnswer);
                    let sortedAnswer = sortByDate([
                        ...response.data.answerList,
                    ]);
                    setAnswerList(sortedAnswer);
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
    }, [socketResponse]);

    const onInputChange = (e, optionId) => {
        setAnswer({
            optionName: e.target.value,
            optionId: optionId,
        });
    };

    // Call api group information
    // async function callApiSubmitOption() {
    //     const accessToken = localStorage.getItem("access_token")
    //     const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/slides/${slideDetail.slideId}`,
    //         {
    //             ...answer
    //         }
    //         , {
    //             headers: { 'Authorization': "Bearer " + accessToken }

    //         })

    //     if (response.status === 200) {
    //         console.log("submit success")
    //     }
    // }

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

    const fetchMoreData = async () => {
        let response = null;
        try {
            let newPage = page + 1;
            if (newPage + 1 === totalPage) {
                setHasMore(false);
            }
            if (isLogin) {
                const accessToken = localStorage.getItem("access_token");
                if (accessToken === null || accessToken === undefined) {
                    return;
                }
                response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/api/chats/${presentDetail.presentId}/${newPage}`,
                    {
                        headers: { Authorization: "Bearer " + accessToken },
                    }
                );
            } else {
                response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/api/chats/public/${presentDetail.presentId}/${newPage}`
                );
            }

            if (response !== null && response.status === 200) {
                console.log("response chat list:", response.data.chatList);
                setChatList((prev) => {
                    let newChatList = [...prev, ...response.data.chatList];
                    console.log("newChatlist: ", newChatList);
                    return newChatList;
                });
            }
            setPage(newPage);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
        }
    };
    const handleAddNewMessage = async () => {
        let response = null;

        try {
            if (isLogin) {
                const accessToken = localStorage.getItem("access_token");
                if (accessToken === null || accessToken === undefined) {
                    return;
                }
                response = await axios.post(
                    `${process.env.REACT_APP_API_ENDPOINT}/api/chats/${presentDetail.presentId}`,
                    {
                        content: chat,
                    },
                    {
                        headers: { Authorization: "Bearer " + accessToken },
                    }
                );
            } else {
                response = await axios.post(
                    `${process.env.REACT_APP_API_ENDPOINT}/api/chats/public/${presentDetail.presentId}`,
                    {
                        content: chat,
                    }
                );
            }

            if (response !== null && response.status === 200) {
                console.log("new Chat: ", response.data.chat);
                //let addedChat = response.data.chat;
                setIsNotify(false);
                // setChatList((prev) => {
                //     let newChatList = [...prev];
                //     newChatList.unshift(addedChat);
                //     return newChatList;
                // });
            }
            setChat("");
            setIsLoading(false);
        } catch (error) {
            setChat("");
            console.log(error);
        }
    };
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

    // if (!presentDetail?.public) {
    //     if (presentDetail?.group === null) {
    //         return (
    //             <div className="relative mx-auto max-w-[72vw] h-screen ">
    //                 <div className="text-red-600 absolute z-10 w-[60%] text-center uppercase text-2xl left-1/2 top-[16%] bg-white border border-red-400 -translate-x-1/2 shadow-lg rounded-lg p-4">
    //                     Present is not presenting
    //                 </div>
    //                 <img
    //                     src={landingImg}
    //                     className="absolute top-1/2 -translate-y-2/4 w-full shadow-lg rounded-lg"
    //                     alt="Slide presentation"
    //                 />
    //             </div>
    //         );
    //     } else if (!isMember) {
    //         return (
    //             <div className="relative mx-auto max-w-[72vw] h-screen ">
    //                 <div className="text-red-600 absolute z-10 w-[60%] text-center uppercase text-2xl left-1/2 top-[16%] bg-white border border-red-400 -translate-x-1/2 shadow-lg rounded-lg p-4">
    //                     You don't have permission to access this presentation
    //                 </div>
    //                 <img
    //                     src={landingImg}
    //                     className="absolute top-1/2 -translate-y-2/4 w-full shadow-lg rounded-lg"
    //                     alt="Slide presentation"
    //                 />
    //             </div>
    //         );
    //     }
    // }
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
                KahooClone
            </h1>
            <div className="flex justify-between flex-wrap flex-row md:px-8 md:py-10 md:pb-20 md:mx-4 p-2 h-[90vh]">
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
                    <div className="font-bold text-xl mb-4">Select option:</div>
                    <div className="overflow-y-auto max-h-[75%] shadow-2xl px-4 py-2">
                        {slideDetail?.optionList.length > 0 ? (
                            slideDetail?.optionList.map((opt) => {
                                return (
                                    <div
                                        className={
                                            opt.optionName ===
                                                answer.optionName &&
                                            opt.optionId === answer.optionId
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
                                                onInputChange(e, opt.optionId)
                                            }
                                            checked={
                                                opt.optionName ===
                                                    answer.optionName &&
                                                opt.optionId === answer.optionId
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
            </div>
            <div>
                {showBox === "chat" && (
                    <div className="flex flex-col fixed z-10 bottom-[10px] right-[70px] bg-white rounded-lg shadow h-[400px] w-[324px]">
                        <div className="flex justify-between bg-[#61dafb] py-2 px-4 rounded-t-lg text-white font-bold">
                            Messages
                            <span
                                className="p-1 cursor-pointer"
                                onClick={() => setShowBox("")}
                            >
                                X
                            </span>
                        </div>
                        <div
                            id="scrollableDiv"
                            style={{
                                height: "300px",
                                overflow: "auto",
                                display: "flex",
                                flexDirection: "column-reverse",
                            }}
                        >
                            <InfiniteScroll
                                dataLength={chatList.length}
                                next={fetchMoreData}
                                hasMore={hasMore}
                                scrollableTarget="scrollableDiv"
                                inverse={true}
                                loader={
                                    <p className="text-center">Loading ...</p>
                                }
                                style={{
                                    display: "flex",
                                    flexDirection: "column-reverse",
                                }}
                                endMessage={
                                    <p style={{ textAlign: "center" }}>
                                        <b>Yay! You have seen it all</b>
                                    </p>
                                }
                            >
                                <ul className="flex flex-col-reverse">
                                    {chatList.length > 0 &&
                                        sortByDate(chatList, true).map(
                                            (chatByDate, index) => {
                                                let list =
                                                    chatByDate[
                                                        Object.keys(
                                                            chatByDate
                                                        )[0]
                                                    ];
                                                console.log(
                                                    chatByDate[
                                                        Object.keys(
                                                            chatByDate
                                                        )[0]
                                                    ]
                                                );
                                                return (
                                                    <>
                                                        {list.map((a) => {
                                                            return (
                                                                <li
                                                                    className="px-4 py-2 mt-1 flex items-center"
                                                                    key={
                                                                        a.chatId
                                                                    }
                                                                >
                                                                    <span
                                                                        className="bg-[#61dafb] px-2 py-1 rounded-full uppercase cursor-default mr-2"
                                                                        title={
                                                                            a
                                                                                .user
                                                                                .firstName
                                                                        }
                                                                    >
                                                                        {
                                                                            a
                                                                                .user
                                                                                .firstName[0]
                                                                        }
                                                                    </span>
                                                                    <span className="border px-2 py-2 rounded-lg bg-slate-100 max-w-[70%]">
                                                                        {
                                                                            a.message
                                                                        }
                                                                    </span>
                                                                    <span className="ml-auto text-xs">
                                                                        {new Date(
                                                                            a.createdAt
                                                                        ).toLocaleTimeString()}
                                                                    </span>
                                                                </li>
                                                            );
                                                        })}
                                                        <div className="text-center text-sm">
                                                            {index ===
                                                            chatList.length - 1
                                                                ? "Today"
                                                                : new Date(
                                                                      Object.keys(
                                                                          chatByDate
                                                                      )[0]
                                                                  )
                                                                      .toLocaleString(
                                                                          "vi-VN"
                                                                      )
                                                                      .slice(
                                                                          10
                                                                      )}
                                                        </div>
                                                    </>
                                                );
                                            }
                                        )}
                                </ul>
                            </InfiniteScroll>
                        </div>
                        <div className="flex justify-between px-4 mt-auto mb-2">
                            <input
                                placeholder="Add new chat"
                                className="border border-sky-400 rounded-2xl px-2 mr-2"
                                value={chat}
                                onChange={(e) => setChat(e.target.value)}
                            />
                            <button
                                className="bg-[#61dafb] hover:bg-[#61fbe2] rounded-2xl px-4 py-2"
                                onClick={handleAddNewMessage}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                )}
                {showBox === "question" && (
                    <div className="flex flex-col fixed z-10 bottom-[10px] right-[70px] bg-white rounded-lg shadow h-[400px] w-[324px]">
                        <div className="flex justify-between bg-[#61dafb] py-2 px-4 rounded-t-lg text-white font-bold">
                            Questions
                            <span
                                className="p-1 cursor-pointer"
                                onClick={() => setShowBox("")}
                            >
                                X
                            </span>
                        </div>
                        <ul className=" overflow-y-scroll h-[80%]">
                            {presentDetail?.questionList.length > 0 &&
                                presentDetail.questionList.map((q) => {
                                    return (
                                        <li
                                            className="px-4 py-2 mt-1 flex items-center"
                                            key={q.questionId}
                                        >
                                            <span
                                                className="bg-[#61dafb] px-2 py-1 rounded-full uppercase cursor-default mr-2"
                                                title={q.user.firstName}
                                            >
                                                {q.user.firstName[0]}
                                            </span>
                                            <span className="border px-2 py-2 rounded-lg bg-slate-100 max-w-[70%]">
                                                {q.content}
                                            </span>
                                            <span className="ml-auto text-xs">
                                                {new Date(
                                                    q.createdAt
                                                ).toLocaleTimeString()}
                                            </span>
                                        </li>
                                    );
                                })}
                        </ul>
                        <div className="flex justify-between px-4 mt-auto mb-2">
                            <input
                                placeholder="Add new question"
                                className="border border-sky-400 rounded-2xl px-2 mr-2"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                            <button className="bg-[#61dafb] hover:bg-[#61fbe2] rounded-2xl px-4 py-2 ">
                                Submit
                            </button>
                        </div>
                    </div>
                )}
                {showBox === "answer" && (
                    <div className="flex flex-col fixed z-10 bottom-[10px] right-[70px] bg-white rounded-lg shadow h-[400px] w-[324px]">
                        <div className="flex justify-between bg-[#61dafb] py-2 px-4 rounded-t-lg text-white font-bold">
                            Answer Result
                            <span
                                className="p-1 cursor-pointer"
                                onClick={() => setShowBox("")}
                            >
                                X
                            </span>
                        </div>
                        <ul className=" overflow-y-scroll h-[80%]">
                            {answerList.length > 0 &&
                                answerList.map((answersByDate, index) => {
                                    let list =
                                        answersByDate[
                                            Object.keys(answersByDate)[0]
                                        ];
                                    return (
                                        <>
                                            <div className="text-center text-sm">
                                                {index === answerList.length - 1
                                                    ? "Today"
                                                    : new Date(
                                                          Object.keys(
                                                              answersByDate
                                                          )[0]
                                                      )
                                                          .toLocaleString(
                                                              "vi-VN"
                                                          )
                                                          .slice(10)}
                                            </div>
                                            {list.map((a) => {
                                                return (
                                                    <li
                                                        className="px-4 py-2 mt-1 flex items-center"
                                                        key={a.answerId}
                                                    >
                                                        <span
                                                            className="bg-[#61dafb] px-2 py-1 rounded-full uppercase cursor-default mr-2"
                                                            title={
                                                                a.user.firstName
                                                            }
                                                        >
                                                            {
                                                                a.user
                                                                    .firstName[0]
                                                            }
                                                        </span>
                                                        <span className="border px-2 py-2 rounded-lg bg-slate-100 max-w-[70%]">
                                                            {
                                                                a.option
                                                                    .optionName
                                                            }
                                                        </span>
                                                        <span className="ml-auto text-xs">
                                                            {new Date(
                                                                a.createdAt
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </>
                                    );
                                })}
                        </ul>
                    </div>
                )}
            </div>
            <div className="fixed right-[10px] bottom-[10px]">
                <div
                    className="bg-[#61dafb] rounded-full p-3  hover:shadow-2xl shadow cursor-pointer"
                    onClick={() => setShowBox("chat")}
                >
                    <BsFillChatFill size={36} color="#ffffff" />
                </div>
                <div
                    className="bg-[#61dafb] rounded-full p-3  hover:shadow-2xl shadow my-2 cursor-pointer"
                    onClick={() => setShowBox("question")}
                >
                    <BsFillQuestionCircleFill size={36} color="#ffffff" />
                </div>
                <div
                    className="bg-[#61dafb] rounded-full p-3  hover:shadow-2xl shadow cursor-pointer"
                    onClick={() => setShowBox("answer")}
                >
                    <RiSurveyFill size={36} color="#ffffff" />
                </div>
            </div>
        </div>
    );
}
{
    /* chatList.map((q) => {
                                            return (
                                                <li
                                                    className="px-4 py-2 mt-1 flex items-center"
                                                    key={q.chatId}
                                                >
                                                    <span
                                                        className="bg-[#61dafb] px-2 py-1 rounded-full uppercase cursor-default mr-2"
                                                        title={q.user.firstName}
                                                    >
                                                        {q.user.firstName[0]}
                                                    </span>
                                                    <span className="border px-2 py-2 rounded-lg bg-slate-100 max-w-[70%]">
                                                        {q.message}
                                                    </span>
                                                    <span className="ml-auto text-xs">
                                                        {new Date(
                                                            q.createdAt
                                                        ).toLocaleTimeString()}
                                                    </span>
                                                </li>
                                            );
                                        }) */
}
export default SlidePresent;
