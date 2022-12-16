import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarChart, Bar, LabelList, XAxis, ResponsiveContainer } from "recharts";
import { refreshAccessToken } from "../utils/auth";
import ReactLoading from "react-loading";
import { useSocket } from "../customHook/useSocket";
import { toast } from "react-toastify";

function PresentationEdit() {
    const { isConnected, socketResponse, sendData } = useSocket(
        "public",
        "khai"
    );
    const [isLoading, setIsLoading] = useState(true);
    const [fullScreenMode, setFullScreenMode] = useState(false);
    const [presentDetail, setPresentDetail] = useState({
        preId: "",
        createdAt: "",
        preName: "",
        slideList: [],
    });
    const [currentSlide, setCurrentSlide] = useState({
        slideId: "",
        heading: "",
        optionList: [],
    });
    const navigate = useNavigate();
    const params = useParams();

    // Notify copy link presentation
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

    // Initial call
    useEffect(() => {
        getPresentDetail();
    }, [params.presentId, navigate]);

    async function callApiSlideDetail(slideId) {
        const response = await axios.get(
            `${process.env.REACT_APP_API_ENDPOINT}/api/slides/${slideId}`
        );

        if (response.status === 200) {
            let newSlideDetail = response.data.slide;
            console.log("newslide: ", newSlideDetail);
            newSlideDetail.optionList.sort((a, b) => a.optionId - b.optionId);
            setCurrentSlide(newSlideDetail);
        }
    }

    // Get group info, do some validate
    async function getSlideDetail(slideId) {
        if (slideId == null) {
            return;
        }
        try {
            await callApiSlideDetail(slideId);
        } catch (error) {
            await callApiSlideDetail(slideId);
        }
    }

    // When socket resposne change
    useEffect(() => {
        setCurrentSlide((pre) => {
            // if (socketResponse?.slide) {
            //     return socketResponse?.slide;
            // }

            // Get option null
            let option = socketResponse?.option;
            // If socket message is update slide not update vote option
            if (option === null || option === undefined) {
                return pre;
            }

            let newOptionList = [...pre.optionList];
            let index = newOptionList.findIndex(
                (opt) => opt.optionId === option.optionId
            );
            // If socket message send for other presentation
            if (index === -1) {
                return pre;
            }
            // If socket message send for this presentation
            newOptionList[index] = {
                optionId: option.optionId,
                optionName: option.optionName,
                vote: option.vote,
            };
            console.log("index", newOptionList[index]);
            return {
                ...pre,
                optionList: [...newOptionList],
            };
        });
    }, [socketResponse]);

    // const sendMessage = (e) => {
    //     console.log("click send mesg")
    //     e.preventDefault();
    //     sendData({
    //         option: {
    //             optionId: "demo",
    //             optionName: "demo",
    //             vote: "demo"
    //         }
    //     });

    // };

    // Call api group information
    async function callApiPresentDetail() {
        const presentId = params.presentId;
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get(
            `${process.env.REACT_APP_API_ENDPOINT}/api/presents/${presentId}`,
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );

        if (response.status === 200) {
            let newPresentDetail = { ...response.data.presentation };
            newPresentDetail.slideList.sort((a, b) => a.slideId - b.slideId);
            newPresentDetail.slideList[0]?.optionList?.sort(
                (a, b) => a.optionId - b.optionId
            );
            setPresentDetail({
                ...newPresentDetail,
            });

            setCurrentSlide(newPresentDetail.slideList[0]);
        }
        setIsLoading(false);
    }

    // Get group info, do some validate
    async function getPresentDetail() {
        const presentId = params.presentId;
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        if (presentId == null || presentId.trim().length <= 0) {
            return;
        }
        try {
            await callApiPresentDetail();
        } catch (error) {
            try {
                await refreshAccessToken();
            } catch (error) {
                navigate("/login");
            }
            await callApiPresentDetail();
        }
    }

    const onSlideQuestionChange = (e) => {
        //setSlideQuestion(e.target.value);
        setCurrentSlide((prev) => {
            return {
                ...prev,
                heading: e.target.value,
            };
        });
    };

    const handleAddOption = (e) => {
        // setChartData(prevState => {
        //     return [
        //         ...prevState,
        //         {
        //             optionName: "Option",
        //             vote: 0
        //         }
        //     ]
        // })
        setCurrentSlide((prev) => {
            var newOptionList = [
                ...prev.optionList,
                {
                    optionId: 0,
                    optionName: "Option",
                    vote: 0,
                },
            ];
            return {
                ...prev,
                optionList: newOptionList,
            };
        });
    };

    const handleRemoveOption = (index) => {
        // setChartData(prevState => {
        //     let newState = [...prevState]
        //     newState.splice(index, 1)
        //     return newState

        // })
        setCurrentSlide((prev) => {
            var newOptionList = [...prev.optionList];
            newOptionList.splice(index, 1);
            return {
                ...prev,
                optionList: newOptionList,
            };
        });
    };

    const onChartDataChange = (e, index) => {
        // setChartData(prevState => {
        //     var newState = [...prevState]
        //     newState[index] = {
        //         optionName: e.target.value,
        //         vote: prevState[index].vote
        //     }
        //     return [
        //         ...newState
        //     ]
        // })
        setCurrentSlide((prev) => {
            var newOptionList = [...prev.optionList];
            newOptionList[index] = {
                optionId: newOptionList[index].optionId,
                optionName: e.target.value,
                vote: newOptionList[index].vote,
            };
            return {
                ...prev,
                optionList: newOptionList,
            };
        });
    };

    const onChangeSlide = async (slideIndex, slideId) => {
        await getSlideDetail(slideId);
        // console.log("new slide in change:", newSlide);
        // setCurrentSlide(newSlide)
    };

    const callApiCreateNewSlide = async () => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.post(
            `${process.env.REACT_APP_API_ENDPOINT}/api/slides`,
            {
                preId: presentDetail.preId,
                typeName: "multiple",
            },
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );
        if (response.status === 200) {
            setCurrentSlide(response.data.slide);

            setPresentDetail((prev) => {
                var newSlideList = prev.slideList;
                newSlideList.push(response.data.slide);
                return {
                    ...prev,
                    slideList: newSlideList,
                };
            });
        }
    };
    const handleAddNewSlide = async (e) => {
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }

        try {
            e.target.disabled = true;
            await callApiCreateNewSlide();
            e.target.disabled = false;
        } catch (error) {
            try {
                await refreshAccessToken();
            } catch (error) {
                navigate("/login");
            }
            await callApiCreateNewSlide();
        } finally {
            e.target.disabled = false;
        }
    };

    const callApiDeleteSlide = async (slideId) => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.delete(
            `${process.env.REACT_APP_API_ENDPOINT}/api/slides/${slideId}`,
            {
                headers: {
                    Authorization: "Bearer " + accessToken,
                },
            }
        );
        if (response.status === 200) {
            setPresentDetail((prev) => {
                var newSlideList = prev.slideList.filter(
                    (s) => s.slideId !== slideId
                );
                return {
                    ...prev,
                    slideList: newSlideList,
                };
            });
        }
    };

    const handleDeleteSlide = async (e, slideId) => {
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }

        try {
            e.target.disabled = true;
            await callApiDeleteSlide(slideId);
            e.target.disabled = false;
        } catch (error) {
            try {
                await refreshAccessToken();
            } catch (error) {
                navigate("/login");
            }
            await callApiDeleteSlide();
        } finally {
            e.target.disabled = false;
        }
    };

    const callApiSaveSlide = async () => {
        let accessToken = localStorage.getItem("access_token");
        console.log(currentSlide);
        const response = await axios.put(
            `${process.env.REACT_APP_API_ENDPOINT}/api/slides`,
            {
                ...currentSlide,
            },
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );
        if (response.status === 200) {
            await getSlideDetail(currentSlide.slideId);
        }
    };

    const handleSaveSlide = async (e) => {
        // console.log("currentSlide: ", currentSlide)
        // sendData({
        //     message: "send_update",
        //     slide: currentSlide
        // });
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }

        try {
            e.target.disabled = true;
            await callApiSaveSlide();
            e.target.disabled = false;
        } catch (error) {
            try {
                await refreshAccessToken();
            } catch (error) {
                navigate("/login");
            }
            await callApiSaveSlide();
        } finally {
            e.target.disabled = false;
        }
    };

    const handlePresentSlide = () => {
        setFullScreenMode(true);
    };

    if (fullScreenMode) {
        return (
            <div className="flex flex-col basis-2/4 bg-gray-200 px-8 py-10 pb-20 mx-4 h-[70vh]">
                <div className="border w-full h-full bg-white">
                    <div className="mt-8 ml-4 mb-4 text-xl font-bold">
                        {currentSlide?.heading}
                    </div>
                    {currentSlide?.optionList.length > 0 && (
                        <div className="h-[250px]">
                            <ResponsiveContainer>
                                <BarChart
                                    data={currentSlide?.optionList}
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
                <div className="flex justify-end mt-6">
                    <button
                        className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                        onClick={() => {
                            setFullScreenMode(false);
                        }}
                    >
                        Stop Present
                    </button>
                </div>
            </div>
        );
    }

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
        <div className="mb-8 -mx-16">
            {/* <button className="p-10 border" onClick={(e) => sendMessage(e)}>Send messageType</button> */}
            <div className="font-bold text-2xl mb-8">
                <span className="bg-[#61dafb] px-4 py-2 rounded-full uppercase mr-2">
                    {presentDetail?.preName[0]}
                </span>
                <span className="italic">{presentDetail.preName}</span>
            </div>
            <div className="flex justify-between mb-4">
                <button
                    onClick={(e) =>
                        toast.promise(
                            async () => await handleAddNewSlide(e),
                            {
                                pending: "Adding new slide",
                                success: "Adding new slide success 👌",
                                error: "Adding new slide failed  🤯",
                            },
                            {
                                className: "mt-10",
                            }
                        )
                    }
                    className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                >
                    New Slide
                </button>
                <div className="flex">
                    <button
                        onClick={(e) => handleSaveSlide(e)}
                        className="rounded mr-4 px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                    >
                        Save slide
                    </button>
                    <button
                        onClick={handlePresentSlide}
                        className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                    >
                        Present
                    </button>
                </div>
            </div>

            <div className="flex grow flex-wrap lg:flex-nowrap">
                <div className="basis-1/5">
                    <ul>
                        {presentDetail.slideList.length > 0 &&
                            presentDetail.slideList.map((slide, index) => {
                                return (
                                    <li
                                        className="flex mt-2 flex-col"
                                        key={slide.slideId}
                                        onClick={(e) =>
                                            onChangeSlide(index, slide?.slideId)
                                        }
                                    >
                                        <div className="flex">
                                            <p>{index + 1}</p>
                                            {slide.slideId ===
                                            currentSlide.slideId ? (
                                                <div className="flex flex-col justify-center bg-white border border-black cursor-pointer h-24 w-40 rounded-lg shadow ml-2">
                                                    <p className="text-xs text-center">
                                                        {slide?.heading}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col justify-center bg-white border hover:border-black cursor-pointer h-24 w-40 rounded-lg shadow ml-2">
                                                    <p className="text-xs text-center">
                                                        {slide?.heading}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="ml-2">
                                                <span
                                                    onClick={(e) =>
                                                        handleDeleteSlide(
                                                            e,
                                                            slide.slideId
                                                        )
                                                    }
                                                    className=" cursor-pointer hover:text-red-500 disabled:hover:text-red-500 disabled:opacity-50"
                                                >
                                                    X
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
                <div className="flex flex-col basis-7/12 bg-gray-200 px-8 py-10 pb-20 mx-4 h-[70vh]">
                    <div className="border w-full h-full bg-white">
                        <div className="mt-8 ml-4 mb-4 text-xl font-bold">
                            {currentSlide?.heading}
                        </div>
                        {currentSlide?.optionList.length > 0 && (
                            <div className="h-[250px]">
                                <ResponsiveContainer>
                                    <BarChart
                                        width={730}
                                        height={250}
                                        data={currentSlide?.optionList}
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
                    {currentSlide?.slideId && (
                        <div className="mt-4 flex ">
                            <p className="mr-4 self-center font-bold">
                                <span className="italic font-normal">
                                    Link Present:{" "}
                                </span>
                                {`${process.env.REACT_APP_BASE_URL}/home/slide/vote/${currentSlide.slideId}`}
                            </p>
                            <button
                                className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `${process.env.REACT_APP_BASE_URL}/home/slide/vote/${currentSlide.slideId}`
                                    );
                                    notifyCopy();
                                }}
                            >
                                Copy Link
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex basis-1/5 flex-col px-4 py-2">
                    <div className="flex flex-col border-b pb-8">
                        <span className="font-bold"> Slide type</span>
                        <select className="px-4 py-2 mt-2 outline-none">
                            <option value="multiple">Multiple Choice</option>
                            <option value="paragraph">Paragraph</option>
                            <option value="heading">Heading</option>
                        </select>
                    </div>
                    <div className="flex flex-col mb-4">
                        <label className="font-bold mt-2">Your question</label>
                        <input
                            placeholder="Your question"
                            className="border px-2 py-1 mt-2"
                            value={currentSlide?.heading}
                            onChange={onSlideQuestionChange}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold">Options</span>
                        {currentSlide?.optionList.map((d, index) => {
                            return (
                                <div className="flex mt-2">
                                    <input
                                        onChange={(e) =>
                                            onChartDataChange(e, index)
                                        }
                                        value={d.optionName}
                                        placeholder="Option"
                                        className="border px-2 py-1 grow outline-sky-500"
                                    />
                                    <button
                                        onClick={(e) =>
                                            handleRemoveOption(index)
                                        }
                                        className="self-center px-2"
                                    >
                                        X
                                    </button>
                                </div>
                            );
                        })}
                        {currentSlide?.optionList.length === 10 ? (
                            <div></div>
                        ) : (
                            <button
                                onClick={(e) => handleAddOption(e)}
                                className="border bg-gray-200 hover:bg-gray-300 outline-none mt-4 font-bold rounded px-4 py-2"
                            >
                                + Add Option
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PresentationEdit;
