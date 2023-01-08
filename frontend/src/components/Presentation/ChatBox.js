import InfiniteScroll from "react-infinite-scroll-component";

function ChatBox({
    chat,
    setChat,
    chatList,
    setShowBox,
    handleAddNewMessage,
    fetchMoreData,
    hasMore,
    sortByDate,
}) {
    return (
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
                    loader={<p className="text-center">Loading ...</p>}
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
                                        chatByDate[Object.keys(chatByDate)[0]];
                                    console.log(
                                        chatByDate[Object.keys(chatByDate)[0]]
                                    );
                                    return (
                                        <>
                                            {list.map((a) => {
                                                return (
                                                    <li
                                                        className="px-4 py-2 mt-1 flex items-center"
                                                        key={a.chatId}
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
                                                            {a.message}
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
                                                {index === chatList.length - 1
                                                    ? "Today"
                                                    : new Date(
                                                          Object.keys(
                                                              chatByDate
                                                          )[0]
                                                      )
                                                          .toLocaleString(
                                                              "vi-VN"
                                                          )
                                                          .slice(10)}
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
    );
}

export default ChatBox;
