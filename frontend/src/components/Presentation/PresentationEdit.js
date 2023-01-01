import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarChart, Bar, LabelList, XAxis, ResponsiveContainer } from "recharts";
import { refreshAccessToken } from "../utils/auth";
import ReactLoading from "react-loading";
import { useSocket } from "../customHook/useSocket";
import { toast } from "react-toastify";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

function PresentationEdit() {
    // Fullscreen mode with react-full-screen
    const handle = useFullScreenHandle();
    const params = useParams();

    // Socker
    const { isConnected, socketResponse, sendData } = useSocket(
        `present${params.presentId}`,
        "khai"
    );
    // Select present type: public, not presenting or group
    const [presentType, setPresentType] = useState();
    const [showSelectPresentType, setShowSelectPresentType] = useState(false);
    // List group to present
    const [presentGroupList, setPresentGroupList] = useState([]);
    // Show group to present
    const [showGroupToPresent, setShowGroupToPresent] = useState(false);
    // Show slide type when add new Slide
    const [showSlideType, setShowSlideType] = useState(false);
    // Presentation Detail
    const [presentDetail, setPresentDetail] = useState({
        presentId: "",
        createdAt: "",
        presentName: "",
        slideList: [],
    });
    // Current slide detail
    const [currentSlide, setCurrentSlide] = useState({
        slideId: "",
        heading: "",
        subHeading: "",
        paragraph: "",
        optionList: [],
    });
    const [fullScreenMode, setFullScreenMode] = useState(false);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

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
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get(
            `${process.env.REACT_APP_API_ENDPOINT}/api/slides/${slideId}`,
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
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

    // Update current slide of the presentation
    async function updateCurrentSlide(slideId) {
        if (slideId == null) {
            return;
        }
        try {
            const presentId = params.presentId;
            const accessToken = localStorage.getItem("access_token");
            await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/api/presents/${presentId}/${slideId}`,
                {},
                {
                    headers: { Authorization: "Bearer " + accessToken },
                }
            );
        } catch (error) {
            console.log(error);
        }
    }

    // When socket resposne change
    useEffect(() => {
        setCurrentSlide((pre) => {
            console.log(presentDetail);
            // if (socketResponse?.slide) {
            //     return socketResponse?.slide;
            // }

            // Get option null
            const newSlideInfo = socketResponse?.currentSlide;
            if (newSlideInfo == null) {
                return;
            }
            console.log("newslide from socket: ", newSlideInfo);
            newSlideInfo.optionList.sort((a, b) => a.optionId - b.optionId);
            return newSlideInfo;
            // let option = socketResponse?.option;
            // // If socket message is update slide not update vote option
            // if (option === null || option === undefined) {
            //     return pre;
            // }

            // let newOptionList = [...pre.optionList];
            // let index = newOptionList.findIndex(
            //     (opt) => opt.optionId === option.optionId
            // );
            // // If socket message send for other presentation
            // if (index === -1) {
            //     return pre;
            // }
            // // If socket message send for this presentation
            // newOptionList[index] = {
            //     optionId: option.optionId,
            //     optionName: option.optionName,
            //     vote: option.vote,
            // };
            // console.log("index", newOptionList[index]);
            // return {
            //     ...pre,
            //     optionList: [...newOptionList],
            // };
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
            newPresentDetail.currentSlide.optionList.sort(
                (a, b) => a.optionId - b.optionId
            );
            setCurrentSlide(newPresentDetail.currentSlide);
            console.log(newPresentDetail);
            let newPresentType = newPresentDetail.public
                ? "Public"
                : newPresentDetail?.group !== null &&
                  newPresentDetail?.group !== undefined
                ? `Group ${newPresentDetail.group}`
                : "Not presenting";
            setPresentType(newPresentType);
        }
        setIsLoading(false);
    }

    // Get present detail
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

    const onSubHeadingChange = (e) => {
        //setSlideQuestion(e.target.value);
        setCurrentSlide((prev) => {
            return {
                ...prev,
                subHeading: e.target.value,
            };
        });
    };

    const onParagraphChange = (e) => {
        //setSlideQuestion(e.target.value);
        setCurrentSlide((prev) => {
            return {
                ...prev,
                paragraph: e.target.value,
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
        await updateCurrentSlide(slideId);
        // console.log("new slide in change:", newSlide);
        // setCurrentSlide(newSlide)
    };

    const callApiCreateNewSlide = async (typeName) => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.post(
            `${process.env.REACT_APP_API_ENDPOINT}/api/slides`,
            {
                presentId: presentDetail.presentId,
                typeName,
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
        setShowSlideType(false);
    };
    const handleAddNewSlide = async (e, typeName) => {
        let accessToken = localStorage.getItem("access_token");
        console.log("typeName: ", typeName);
        if (accessToken == null) {
            navigate("/login");
        }

        try {
            e.target.disabled = true;
            await callApiCreateNewSlide(typeName);
            e.target.disabled = false;
        } catch (error) {
            try {
                await refreshAccessToken();
            } catch (error) {
                navigate("/login");
            }
            await callApiCreateNewSlide(typeName);
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
                        onClick={(e) => {
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

    const multipleSlide = (
        <>
            <div className="flex flex-col basis-7/12 bg-gray-200 px-8 py-10 pb-20 mx-4 h-[70vh]">
                <FullScreen handle={handle}>
                    <div className="border flex flex-col justify-center h-full bg-white full-screenable-node ">
                        <div className="mt-8 ml-4 mb-4 text-xl font-bold">
                            {currentSlide?.heading}
                        </div>
                        {currentSlide?.optionList.length > 0 && (
                            <div className="mx-auto h-[250px] max-w-[60vw]">
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
                            </div>
                        )}
                    </div>
                </FullScreen>
                {currentSlide?.slideId && (
                    <div className="mt-4 flex ">
                        <p className="mr-4 self-center font-bold">
                            <span className="italic font-normal">
                                Link Present:{" "}
                            </span>
                            {`${process.env.REACT_APP_BASE_URL}/home/presentation/${presentDetail.presentId}/vote`}
                        </p>
                        <button
                            className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `${process.env.REACT_APP_BASE_URL}/home/presentation/${presentDetail.presentId}/vote`
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
                    <div className="py-2 mt-2 outline-none">Multiple</div>
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
                                    onClick={(e) => handleRemoveOption(index)}
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
        </>
    );
    const headingSlide = (
        <>
            <div className="flex flex-col basis-7/12 bg-gray-200 px-8 py-10 pb-20 mx-4 h-[70vh]">
                <FullScreen handle={handle}>
                    <div className="flex flex-col min-h-[50vh] justify-center border w-full h-full bg-white text-center">
                        <div className="mt-8 mx-auto mb-2 text-4xl font-bold  max-w-[60%] break-words break-all">
                            {currentSlide?.heading}
                        </div>
                        <div className="mt-2 mx-auto mb-4 text-xl max-w-[60%] break-words break-all">
                            {currentSlide?.subHeading}
                        </div>
                    </div>
                </FullScreen>
                {currentSlide?.slideId && (
                    <div className="mt-4 flex ">
                        <p className="mr-4 self-center font-bold">
                            <span className="italic font-normal">
                                Link Present:{" "}
                            </span>
                            {`${process.env.REACT_APP_BASE_URL}/home/presentation/${presentDetail.presentId}/vote`}
                        </p>
                        <button
                            className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `${process.env.REACT_APP_BASE_URL}/home/presentation/${presentDetail.presentId}/vote`
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
                    <div className="py-2 mt-2 outline-none">Heading</div>
                </div>
                <div className="flex flex-col mb-4">
                    <label className="font-bold mt-2">Heading</label>
                    <input
                        placeholder="Your heading"
                        className="border px-2 py-1 mt-2"
                        value={currentSlide?.heading}
                        onChange={onSlideQuestionChange}
                        maxLength={50}
                    />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold">SubHeading</span>
                    <input
                        placeholder="Your subHeading"
                        className="border px-2 py-1 mt-2"
                        value={currentSlide?.subHeading}
                        onChange={onSubHeadingChange}
                        maxLength={100}
                    />
                </div>
            </div>
        </>
    );
    const paragraphSlide = (
        <>
            <div className="flex flex-col basis-7/12 bg-gray-200 px-8 py-10 pb-20 mx-4 h-[70vh]">
                <FullScreen handle={handle}>
                    <div className="flex flex-col min-h-[50vh] justify-center border w-full h-full bg-white text-center">
                        <div className="mt-8 mx-auto mb-2 text-4xl font-bold  max-w-[60%] break-words break-all">
                            {currentSlide?.heading}
                        </div>
                        <div className="mt-2 mx-auto mb-4 text-xl max-w-[60%] break-words break-all">
                            {currentSlide?.paragraph}
                        </div>
                    </div>
                </FullScreen>
                {currentSlide?.slideId && (
                    <div className="mt-4 flex ">
                        <p className="mr-4 self-center font-bold">
                            <span className="italic font-normal">
                                Link Present:{" "}
                            </span>
                            {`${process.env.REACT_APP_BASE_URL}/home/presentation/${presentDetail.presentId}/vote`}
                        </p>
                        <button
                            className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `${process.env.REACT_APP_BASE_URL}/home/presentation/${presentDetail.presentId}/vote`
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
                    <div className="py-2 mt-2 outline-none">Paragraph</div>
                </div>
                <div className="flex flex-col mb-4">
                    <label className="font-bold mt-2">Heading</label>
                    <input
                        placeholder="Your heading"
                        className="border px-2 py-1 mt-2"
                        value={currentSlide?.heading}
                        onChange={onSlideQuestionChange}
                        maxLength={50}
                    />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold">Paragraph</span>
                    <textarea
                        placeholder="Your paragraph"
                        className="border px-2 py-1 mt-2"
                        value={currentSlide?.paragraph}
                        onChange={onParagraphChange}
                    />
                </div>
            </div>
        </>
    );

    const callApiUpdatePublicPresent = async (isPublic) => {
        let accessToken = localStorage.getItem("access_token");
        await axios.put(
            `${process.env.REACT_APP_API_ENDPOINT}/api/presents`,
            {
                ...presentDetail,
                public: isPublic,
            },
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );
        setPresentType(isPublic ? "Public" : "Not presenting");
        setShowSelectPresentType(false);
    };

    // const handlePresentSlide = () => {
    //     setFullScreenMode(true);
    // };

    // const handleUpdatePublicPresent = async (e, isPublic) => {
    //     let accessToken = localStorage.getItem("access_token");
    //     if (accessToken == null) {
    //         navigate("/login");
    //     }

    //     try {
    //         e.target.disabled = true;
    //         await callApiUpdatePublicPresent(isPublic);
    //         e.target.disabled = false;
    //     } catch (error) {
    //         try {
    //             await refreshAccessToken();
    //         } catch (error) {
    //             navigate("/login");
    //         }
    //         await callApiUpdatePublicPresent(isPublic);
    //     } finally {
    //         e.target.disabled = false;
    //     }
    // };

    const handleCallApi = async (e, callback, ...rest) => {
        console.log("rest:", rest);
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }

        try {
            e.target.disabled = true;
            await callback(rest[0]);
            e.target.disabled = false;
        } catch (error) {
            try {
                await refreshAccessToken();
            } catch (error) {
                navigate("/login");
            }
            await callback(rest[0]);
        } finally {
            e.target.disabled = false;
        }
    };

    const callApiGetListGroup = async () => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.get(
            `${process.env.REACT_APP_API_ENDPOINT}/api/groups`,
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );

        // Set present group list include owner and co-owner group
        let presentGroups = [];
        if (response.data?.owner.length > 0) {
            presentGroups = response.data?.owner;
        }
        if (response.data?.coowner.length > 0) {
            presentGroups = presentGroups.concat(response.data?.coowner);
        }
        setPresentGroupList(presentGroups);
        setShowGroupToPresent(true);
    };

    const handlePresentInGroup = async (groupId) => {
        console.log("groupId", groupId);
        setShowGroupToPresent(false);
        setShowSelectPresentType(false);
    };

    return (
        <div className="mb-8 -mx-16">
            <div className="font-bold text-2xl mb-8 flex">
                <span className="bg-[#61dafb] px-4 py-2 rounded-full uppercase mr-2">
                    {presentDetail?.presentName[0]}
                </span>
                <span className="italic">{presentDetail.presentName}</span>
                <div className="relative bg-white ml-4 text-sm font-normal rounded-lg shadow outline-none">
                    <div
                        className="h-full flex items-center bg-white px-2 py-1 rounded cursor-pointer min-w-[112px]"
                        onClick={() =>
                            setShowSelectPresentType(!showSelectPresentType)
                        }
                    >
                        {presentType}
                    </div>

                    {showSelectPresentType && (
                        <ul className="absolute bg-white shadow">
                            {presentType !== "Public" && (
                                <li
                                    className="px-2 py-1 hover:bg-[#61fbe2] cursor-pointer min-w-[112px]"
                                    onClick={(e) =>
                                        handleCallApi(
                                            e,
                                            callApiUpdatePublicPresent,
                                            true
                                        )
                                    }
                                >
                                    Public
                                </li>
                            )}
                            {presentType !== "Not presenting" && (
                                <li
                                    className="px-2 py-1 hover:bg-[#61fbe2] cursor-pointer min-w-[112px]"
                                    onClick={(e) =>
                                        handleCallApi(
                                            e,
                                            callApiUpdatePublicPresent,
                                            false
                                        )
                                    }
                                >
                                    Not presenting
                                </li>
                            )}
                            <li
                                className="px-2 py-1 hover:bg-[#61fbe2] cursor-pointer min-w-[112px]"
                                onClick={(e) =>
                                    handleCallApi(e, callApiGetListGroup)
                                }
                            >
                                Group
                            </li>
                        </ul>
                    )}
                    {showGroupToPresent && (
                        <div>
                            <div className="z-10 h-screen w-screen fixed bg-slate-400 top-0 left-0 opacity-50"></div>
                            <div className="py-4 fixed rounded-lg shadow z-20 bg-white left-2/4 top-1/2 -translate-x-2/4 -translate-y-1/2">
                                <span className="ml-4 font-bold">
                                    Select group to present:
                                </span>

                                {presentGroupList.length >= 0 &&
                                    presentGroupList.map((group) => {
                                        return (
                                            <div
                                                key={group.groupId}
                                                className="px-4 py-2 flex justify-between hover:bg-slate-300 cursor-pointer"
                                                onClick={() =>
                                                    handlePresentInGroup(
                                                        group.groupId
                                                    )
                                                }
                                            >
                                                Group name:
                                                <span className="italic ml-2 mr-4">
                                                    {group.groupName}
                                                </span>
                                                created at
                                                <span className="italic ml-2">
                                                    {new Date(group.createdAt)
                                                        .toString()
                                                        .slice(0, 24)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                <button
                                    className="ml-4 mt-2 rounded mr-4 px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                                    onClick={() => {
                                        setShowGroupToPresent(false);
                                        setShowSelectPresentType(false);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {/* <select
                    className="ml-4 text-sm font-normal px-2 py-1 rounded-lg cursor-pointer shadow outline-none"
                    value={presentType}
                    onChange
                >
                    <option value="none">Not Presenting</option>
                    <option value="public">Public</option>
                    <option>Group</option>
                </select> */}
            </div>
            <div className="flex justify-between mb-4">
                <div className="relative w-40">
                    <button
                        // onClick={(e) =>
                        //     toast.promise(
                        //         async () => await handleAddNewSlide(e),
                        //         {
                        //             pending: "Adding new slide",
                        //             success: "Adding new slide success 👌",
                        //             error: "Adding new slide failed  🤯",
                        //         },
                        //         {
                        //             className: "mt-10",
                        //         }
                        //     )
                        // }
                        onClick={() => setShowSlideType(!showSlideType)}
                        className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                    >
                        {showSlideType ? "Cancel" : "New Slide"}
                    </button>
                    {showSlideType && (
                        <ul className="z-10 absolute bg-white shadow-2xl">
                            <li
                                className="py-2 px-4 hover:bg-[#61fbe2] cursor-pointer"
                                onClick={(e) =>
                                    handleAddNewSlide(e, "multiple")
                                }
                            >
                                Multiple Choice
                            </li>
                            <li
                                className="py-2 px-4 hover:bg-[#61fbe2] cursor-pointer"
                                onClick={(e) => handleAddNewSlide(e, "heading")}
                            >
                                Heading
                            </li>
                            <li
                                className="py-2 px-4 hover:bg-[#61fbe2] cursor-pointer"
                                onClick={(e) =>
                                    handleAddNewSlide(e, "paragraph")
                                }
                            >
                                Paragraph
                            </li>
                        </ul>
                    )}
                </div>
                <div className="flex">
                    <button
                        onClick={(e) => handleSaveSlide(e)}
                        className="rounded mr-4 px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                    >
                        Save slide
                    </button>
                    <button
                        onClick={() =>
                            navigate(
                                `/home/presentation/${presentDetail.presentId}/coList`
                            )
                        }
                        className="rounded mr-4 px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                    >
                        Collaborator
                    </button>
                    <button
                        onClick={handle.enter}
                        className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50"
                    >
                        Present
                    </button>
                </div>
            </div>

            <div className="flex grow flex-wrap lg:flex-nowrap">
                <div className="basis-1/5">
                    <ul>
                        {presentDetail?.slideList.length > 0 &&
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
                {currentSlide.typeName === "multiple" && multipleSlide}
                {currentSlide.typeName === "heading" && headingSlide}
                {currentSlide.typeName === "paragraph" && paragraphSlide}
            </div>
        </div>
    );
}

export default PresentationEdit;
