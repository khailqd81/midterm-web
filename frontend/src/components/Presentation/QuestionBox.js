import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { AiFillCheckCircle } from "react-icons/ai";
import { useState } from "react";

function QuestionBox({
    setShowBox,
    role,
    question,
    setQuestion,
    handleAddNewQuestion,
    handleMarkAnswer,
    handleUpVote,
    presentDetail,
}) {
    const [filterType, setFilterType] = useState("timeup");

    // asc true sort newest to oldest else reverse
    const sortByCreatedAt = (arr, asc) => {
        let sortedData = null;
        if (asc) {
            sortedData = arr.sort((a, b) => a.createdAt - b.createdAt);
        } else {
            sortedData = arr.sort((a, b) => b.createdAt - a.createdAt);
        }
        return sortedData;
    };

    // isAnswered true sort answer to unanswer (sort by newest to oldest in each group) else reverse
    const sortByAnswered = (arr, isAnswered) => {
        let answeredArr = null;
        let unansweredArr = null;
        answeredArr = arr.filter((e) => e.answered);
        unansweredArr = arr.filter((e) => !e.answered);
        answeredArr.sort((a, b) => b.createdAt - a.createdAt);
        unansweredArr.sort((a, b) => b.createdAt - a.createdAt);
        if (isAnswered) {
            return [...answeredArr, ...unansweredArr];
        } else {
            return [...unansweredArr, ...answeredArr];
        }
    };

    // asc true sort most vote to lowest vote else reverse
    const sortByVote = (arr, asc) => {
        let sortedData = null;
        if (asc) {
            sortedData = arr.sort((a, b) => a.vote - b.vote);
        } else {
            sortedData = arr.sort((a, b) => b.vote - a.vote);
        }
        return sortedData;
    };

    const sortQuestionList = (arr) => {
        switch (filterType) {
            case "voteup": {
                return sortByVote(arr, false);
            }
            case "votedown": {
                return sortByVote(arr, true);
            }
            case "answered": {
                return sortByAnswered(arr, true);
            }
            case "unanswered": {
                return sortByAnswered(arr, false);
            }
            case "timeup": {
                return sortByCreatedAt(arr, false);
            }
            case "timedown": {
                return sortByCreatedAt(arr, true);
            }
            default: {
                return sortByCreatedAt(arr, false);
            }
        }
    };

    return (
        <div className="flex flex-col fixed z-10 bottom-[10px] right-[70px] bg-white rounded-lg shadow h-[400px] w-[600px]">
            <div className="flex justify-between bg-[#61dafb] py-2 px-4 rounded-t-lg text-white font-bold">
                Questions
                <span
                    className="p-1 cursor-pointer"
                    onClick={() => setShowBox("")}
                >
                    X
                </span>
            </div>
            <div className="flex font-bold px-4 py-1 items-center">
                Filter
                {filterType === "voteup" ? (
                    <div
                        className="flex items-center border px-2 py-1 ml-2 rounded-lg bg-slate-100 cursor-pointer select-none bg-green-500 text-white"
                        onClick={() => setFilterType("votedown")}
                    >
                        <span className="mr-2">Vote</span>
                        <FaArrowUp size={14} />
                    </div>
                ) : filterType === "votedown" ? (
                    <div
                        className="flex items-center border px-2 py-1 ml-2 rounded-lg bg-slate-100 cursor-pointer select-none bg-green-500 text-white"
                        onClick={() => setFilterType("voteup")}
                    >
                        <span className="mr-2">Vote</span>
                        <FaArrowDown size={14} />
                    </div>
                ) : (
                    <div
                        className="border px-2 py-1 ml-2 rounded-lg bg-slate-100 cursor-pointer select-none"
                        onClick={() => setFilterType("voteup")}
                    >
                        <span>Vote</span>
                    </div>
                )}
                {filterType === "answered" ? (
                    <div
                        className="flex items-center border px-2 py-1 ml-2 rounded-lg bg-slate-100 cursor-pointer select-none bg-green-500 text-white"
                        onClick={() => setFilterType("unanswered")}
                    >
                        <span className="mr-2">Answered</span>
                    </div>
                ) : filterType === "unanswered" ? (
                    <div
                        className="flex items-center border px-2 py-1 ml-2 rounded-lg bg-slate-100 cursor-pointer select-none bg-green-500 text-white"
                        onClick={() => setFilterType("answered")}
                    >
                        <span className="mr-2">Unanswered</span>
                    </div>
                ) : (
                    <div
                        className="border px-2 py-1 ml-2 rounded-lg bg-slate-100 cursor-pointer select-none"
                        onClick={() => setFilterType("answered")}
                    >
                        <span>Answered</span>
                    </div>
                )}
                {filterType === "timeup" ? (
                    <div
                        className="flex items-center border px-2 py-1 ml-2 rounded-lg bg-slate-100 cursor-pointer select-none bg-green-500 text-white"
                        onClick={() => setFilterType("timedown")}
                    >
                        <span className="mr-2">Time asked</span>
                        <FaArrowUp size={14} />
                    </div>
                ) : filterType === "timedown" ? (
                    <div
                        className="flex items-center border px-2 py-1 ml-2 rounded-lg bg-slate-100 cursor-pointer select-none bg-green-500 text-white"
                        onClick={() => setFilterType("timeup")}
                    >
                        <span className="mr-2">Time asked</span>
                        <FaArrowDown size={14} />
                    </div>
                ) : (
                    <div
                        className="border px-2 py-1 ml-2 rounded-lg bg-slate-100 cursor-pointer select-none"
                        onClick={() => setFilterType("timeup")}
                    >
                        <span>Time asked</span>
                    </div>
                )}
            </div>
            <ul className=" overflow-y-scroll h-[80%]">
                {presentDetail?.questionList.length > 0 &&
                    sortQuestionList(presentDetail.questionList).map((q) => {
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
                                <span className="border px-2 py-2 rounded-lg bg-slate-100 basis-1/2 mr-2">
                                    {q.content}
                                </span>
                                <span className="border px-2 py-2 rounded-lg bg-slate-100 mr-2">
                                    {q.vote}
                                </span>
                                <button
                                    className="bg-[#61dafb] hover:bg-[#61fbe2] rounded-lg  px-2 py-2 mr-2 hover:text-white"
                                    onClick={() => handleUpVote(q.questionId)}
                                >
                                    Vote
                                </button>
                                {q.answered ? (
                                    <div className="">
                                        <AiFillCheckCircle
                                            className="text-green-500"
                                            size={24}
                                        />
                                    </div>
                                ) : role === "owner" || role === "co-owner" ? (
                                    <button
                                        className=""
                                        onClick={() =>
                                            handleMarkAnswer(q.questionId)
                                        }
                                    >
                                        <AiFillCheckCircle
                                            className="text-stone-700 hover:text-green-500 hover:shadow-lg"
                                            size={24}
                                        />
                                    </button>
                                ) : (
                                    <div className="">
                                        <AiFillCheckCircle
                                            className="text-stone-700"
                                            size={24}
                                        />
                                    </div>
                                )}

                                <span className="ml-auto text-xs">
                                    {new Date(q.createdAt).toLocaleString(
                                        "vi-VN"
                                    )}
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
                <button
                    className="bg-[#61dafb] hover:bg-[#61fbe2] rounded-2xl px-4 py-2"
                    onClick={handleAddNewQuestion}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}

export default QuestionBox;
