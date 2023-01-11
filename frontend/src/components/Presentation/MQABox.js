import axios from "axios";
import {
    BsFillChatFill,
    BsFillQuestionCircleFill,
    BsArrowUp,
    BsArrowDown,
} from "react-icons/bs";
import { RiSurveyFill } from "react-icons/ri";
import { useState } from "react";
import AnswerBox from "./AnswerBox";
import ChatBox from "./ChatBox";
import QuestionBox from "./QuestionBox";

function MQABox({
    isLogin,
    role,
    chatList,
    totalPage,
    setChatList,
    answerList,
    presentDetail,
}) {
    const [showBox, setShowBox] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    // Input question and message
    const [chat, setChat] = useState("");
    const [question, setQuestion] = useState("");

    const sortByDate = (arraySort, isDesc) => {
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

        // const createMessagesArray = (messages) => {
        //     const newDay = {};
        //     newDay[currentDay.toISOString().split("T")[0]] = messages;
        //     fullMessageArray.push(newDay);
        // };
        const createMessagesArray = (messages) => {
            const newDay = {};

            newDay[currentDay.toLocaleString("vi-VN").slice(10)] = messages;
            //newDay[currentDay.toISOString().split("T")[0]] = messages;
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
    };

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
            }
            setChat("");
        } catch (error) {
            setChat("");
            console.log(error);
        }
    };

    const handleAddNewQuestion = async () => {
        let response = null;

        try {
            if (isLogin) {
                const accessToken = localStorage.getItem("access_token");
                if (accessToken === null || accessToken === undefined) {
                    return;
                }
                response = await axios.post(
                    `${process.env.REACT_APP_API_ENDPOINT}/api/questions/${presentDetail.presentId}`,
                    {
                        content: question,
                    },
                    {
                        headers: { Authorization: "Bearer " + accessToken },
                    }
                );
            } else {
                response = await axios.post(
                    `${process.env.REACT_APP_API_ENDPOINT}/api/questions/public/${presentDetail.presentId}`,
                    {
                        content: question,
                    }
                );
            }

            if (response !== null && response.status === 200) {
                console.log("new Question: ", response.data.question);
                //let addedChat = response.data.chat;
                // setChatList((prev) => {
                //     let newChatList = [...prev];
                //     newChatList.unshift(addedChat);
                //     return newChatList;
                // });
            }
            setQuestion("");
        } catch (error) {
            setQuestion("");
            console.log(error);
        }
    };

    const handleUpVote = async (questionId) => {
        let response = null;

        try {
            if (isLogin) {
                const accessToken = localStorage.getItem("access_token");
                if (accessToken === null || accessToken === undefined) {
                    return;
                }
                response = await axios.put(
                    `${process.env.REACT_APP_API_ENDPOINT}/api/questions/${questionId}/vote`,
                    {},
                    {
                        headers: { Authorization: "Bearer " + accessToken },
                    }
                );
            } else {
                response = await axios.post(
                    `${process.env.REACT_APP_API_ENDPOINT}/api/questions/public/${questionId}/vote`,
                    {}
                );
            }

            if (response !== null && response.status === 200) {
                console.log("new Question: ", response.data.question);
                //let addedChat = response.data.chat;
                // setChatList((prev) => {
                //     let newChatList = [...prev];
                //     newChatList.unshift(addedChat);
                //     return newChatList;
                // });
            }
            setQuestion("");
        } catch (error) {
            setQuestion("");
            console.log(error);
        }
    };

    const handleMarkAnswer = async (questionId) => {
        try {
            const accessToken = localStorage.getItem("access_token");
            if (accessToken === null || accessToken === undefined) {
                return;
            }
            const response = await axios.put(
                `${process.env.REACT_APP_API_ENDPOINT}/api/questions/${questionId}/answer`,
                {},
                {
                    headers: { Authorization: "Bearer " + accessToken },
                }
            );
            if (response !== null && response.status === 200) {
                console.log("answered Question: ", response.data.question);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div>
                {showBox === "chat" && (
                    <ChatBox
                        chat={chat}
                        setChat={setChat}
                        chatList={chatList}
                        setShowBox={setShowBox}
                        handleAddNewMessage={handleAddNewMessage}
                        fetchMoreData={fetchMoreData}
                        hasMore={hasMore}
                        sortByDate={sortByDate}
                    />
                )}
                {showBox === "question" && (
                    <QuestionBox
                        setShowBox={setShowBox}
                        question={question}
                        role={role}
                        setQuestion={setQuestion}
                        handleAddNewQuestion={handleAddNewQuestion}
                        handleMarkAnswer={handleMarkAnswer}
                        handleUpVote={handleUpVote}
                        presentDetail={presentDetail}
                    />
                )}
                {showBox === "answer" && (
                    <AnswerBox
                        answerList={answerList}
                        setShowBox={setShowBox}
                        sortByDate={sortByDate}
                    />
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
                {role !== "member" && (
                    <div
                        className="bg-[#61dafb] rounded-full p-3  hover:shadow-2xl shadow cursor-pointer"
                        onClick={() => setShowBox("answer")}
                    >
                        <RiSurveyFill size={36} color="#ffffff" />
                    </div>
                )}
            </div>
        </>
    );
}
export default MQABox;
