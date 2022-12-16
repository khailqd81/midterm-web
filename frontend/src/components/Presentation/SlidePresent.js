import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarChart, Bar, LabelList, XAxis, ResponsiveContainer } from "recharts";
import ReactLoading from "react-loading";
import axios from "axios";
import { useSocket } from "../customHook/useSocket";
import { v4 as uuidv4 } from "uuid";
function SlidePresent() {
    const { isConnected, socketResponse, sendData } = useSocket(
        "public",
        "khai" + uuidv4()
    );
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
    const [answer, setAnswer] = useState({
        optionName: "",
        optionId: "",
    });
    const navigate = useNavigate();
    const params = useParams();
    // Call api group information
    async function callApiSlideDetail() {
        const slideId = params.slideId;
        const response = await axios.get(
            `${process.env.REACT_APP_API_ENDPOINT}/api/slides/${slideId}`
        );

        if (response.status === 200) {
            let newSlideDetail = response.data.slide;
            newSlideDetail.optionList.sort((a, b) => a.optionId - b.optionId);
            setSlideDetail(newSlideDetail);
        }
        setIsLoading(false);
    }
    // Get group info, do some validate
    async function getSlideDetail() {
        const slideId = params.slideId;

        if (slideId == null || slideId.trim().length <= 0) {
            return;
        }
        try {
            await callApiSlideDetail();
        } catch (error) {
            await callApiSlideDetail();
        }
    }

    useEffect(() => {
        console.log(socketResponse);
        getSlideDetail();
    }, [socketResponse, params.slideId, navigate]);

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

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        // console.log({
        //     slideId: slideDetail.slideId,
        //     option: answer
        // })
        sendData({
            slideId: slideDetail.slideId,
            option: answer,
        });
        // let accessToken = localStorage.getItem("access_token");
        // if (accessToken == null) {
        //     navigate("/login");
        // }

        // try {
        //     await callApiSubmitOption();
        // } catch (error) {
        //     await callApiSubmitOption();
        // }
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
        </div>
    );
}

export default SlidePresent;
