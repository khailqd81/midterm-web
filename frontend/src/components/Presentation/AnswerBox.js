function AnswerBox({ setShowBox, answerList }) {
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
    };

    return (
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
                    sortByDate(answerList, false).map(
                        (answersByDate, index) => {
                            let list =
                                answersByDate[Object.keys(answersByDate)[0]];
                            return (
                                <>
                                    <div className="text-center text-sm">
                                        {index === answerList.length - 1
                                            ? "Today"
                                            : new Date(
                                                  Object.keys(answersByDate)[0]
                                              )
                                                  .toLocaleString("vi-VN")
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
                                                    title={a.user.firstName}
                                                >
                                                    {a.user.firstName[0]}
                                                </span>
                                                <span className="border px-2 py-2 rounded-lg bg-slate-100 max-w-[70%]">
                                                    {a.option.optionName}
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
                        }
                    )}
            </ul>
        </div>
    );
}

export default AnswerBox;
