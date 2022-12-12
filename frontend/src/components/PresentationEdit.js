import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    BarChart, Bar, LabelList, XAxis
} from 'recharts';
import { refreshAccessToken } from "./utils/auth";
import ReactLoading from "react-loading";
import { useSocket } from "./customHook/useSocket";

function PresentationEdit() {

    const { isConnected, socketResponse, sendData } = useSocket("public", "khai");
    const [presentDetail, setPresentDetail] = useState({
        preId: "",
        createdAt: "",
        preName: "",
        slideList: [],
    })
    // const [chartData, setChartData] = useState([{
    //     "optionName": "Option A",
    //     "vote": 1
    // },
    // {
    //     "optionName": "Option B",
    //     "vote": 20
    // },
    // {
    //     "optionName": "Option C",
    //     "vote": 10
    // },])

    // const [optionAmount, setOptionAmount] = useState(0);
    // const [slideQuestion, setSlideQuestion] = useState("Multiple choice")
    const [currentSlide, setCurrentSlide] = useState({
        slideId: "",
        heading: "",
        optionList: []
    })
    const [isLoading, setIsLoading] = useState(true);
    /**/
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        console.log("socketResepon call: ", socketResponse)
       setCurrentSlide(pre => {
            let newOptionList = pre.optionList;
            let index = newOptionList.findIndex(opt => opt.optionId === socketResponse.optionId)
            newOptionList[index] = {
                optionId: socketResponse.optionId,
                optionName: socketResponse.optionName,
                vote: socketResponse.vote
            };
            console.log("index", newOptionList[index])
            return {
                ...pre,
                optionList: [...newOptionList]
            }
       })
    }, [socketResponse])

    const sendMessage = (e) => {
        console.log("click send mesg")
        e.preventDefault();
        sendData({
            content: "socket demo" + Math.random(),
        });

    };
    // Call api group information
    async function callApiPresentDetail() {
        const presentId = params.presentId;
        const accessToken = localStorage.getItem("access_token")
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/presents/${presentId}`, {
            headers: { 'Authorization': "Bearer " + accessToken }
        })

        if (response.status === 200) {
            let newPresentDetail = { ...response.data.presentation }
            newPresentDetail.slideList.sort((a, b) => a.slideId - b.slideId)
            setPresentDetail({
                ...newPresentDetail,
            })
            setCurrentSlide(newPresentDetail.slideList[0])
            //setSlideQuestion(newPresentDetail.slideList[0].heading);
            //setChartData(newPresentDetail.slideList[0].optionList);
        }
        setIsLoading(false)
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
                await callApiPresentDetail();
            } catch (error) {
                navigate("/login")
            }
        }
    }

    useEffect(() => {
        getPresentDetail();
    }, [params.presentId, navigate])

    const onSlideQuestionChange = (e) => {
        //setSlideQuestion(e.target.value);
        setCurrentSlide(prev => {
            return {
                ...prev,
                heading: e.target.value,
            }
        })
    }

    const handleAddOption = () => {
        // setChartData(prevState => {
        //     return [
        //         ...prevState,
        //         {
        //             optionName: "Option",
        //             vote: 0
        //         }
        //     ]
        // })
        setCurrentSlide(prev => {
            var newOptionList = [
                ...prev.optionList,
                {
                    optionName: "Option",
                    vote: 0
                }]
            return {
                ...prev,
                optionList: newOptionList
            }
        })
    }

    const handleRemoveOption = (index) => {
        // setChartData(prevState => {
        //     let newState = [...prevState]
        //     newState.splice(index, 1)
        //     return newState

        // })
        setCurrentSlide(prev => {
            var newOptionList = [...prev.optionList]
            newOptionList.splice(index, 1)
            return {
                ...prev,
                optionList: newOptionList
            }
        })
    }

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
        setCurrentSlide(prev => {
            var newOptionList = [...prev.optionList]
            newOptionList[index] = {
                optionName: e.target.value,
                vote: newOptionList[index].vote
            }
            return {
                ...prev,
                optionList: newOptionList
            }
        })
    }

    const onChangeSlide = (slideIndex) => {
        setCurrentSlide(presentDetail.slideList[slideIndex])
    }

    const callApiCreateNewSlide = async () => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/slides`, {
            preId: presentDetail.preId,
            typeName: "multiple"
        }, {
            headers: { 'Authorization': "Bearer " + accessToken }
        })
        if (response.status === 200) {
            setCurrentSlide(response.data.slide);

            setPresentDetail(prev => {
                var newSlideList = prev.slideList;
                newSlideList.push(response.data.slide)
                return {
                    ...prev,
                    slideList: newSlideList
                }
            })
        }
    }
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
                navigate("/login")
            }
            await callApiCreateNewSlide();
        } finally {
            e.target.disabled = false;
        }
    }

    const handlePresentSlide = () => {

    }

    const callApiDeleteSlide = async (slideId) => {
        let accessToken = localStorage.getItem("access_token");
        const response = await axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/api/slides/${slideId}`, {
            headers: {
                'Authorization': "Bearer " + accessToken
            }
        })
        if (response.status === 200) {

            setPresentDetail(prev => {
                var newSlideList = prev.slideList.filter(s => s.slideId !== slideId);
                return {
                    ...prev,
                    slideList: newSlideList
                }
            })
        }
    }

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
                navigate("/login")
            }
            await callApiDeleteSlide();
        } finally {
            e.target.disabled = false;
        }
    }

    if (isLoading) {
        return (<div className="mx-auto h-[100vh] relative">
            <ReactLoading className="fixed mx-auto top-[50%] left-[50%] -translate-x-2/4 -translate-y-1/2" type="spin" color="#7483bd" height={100} width={100} />
        </div>)
    }

    return (
        <div className="mb-8 -mx-16">
            <button className="p-10 border" onClick={(e) => sendMessage(e)}>Send messageType</button>
            <div className="font-bold text-2xl mb-8">
                <span className="bg-[#61dafb] px-4 py-2 rounded-full uppercase mr-2">{presentDetail?.preName[0]}</span>
                <span className="italic">{presentDetail.preName}</span>
            </div>
            <div className="flex justify-between mb-4">
                <button onClick={e => handleAddNewSlide(e)} className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50">New Slide</button>
                <button onClick={handlePresentSlide} className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50">Present</button>
            </div>

            <div className="flex grow ">
                <div className="basis-1/5">
                    <ul>
                        {presentDetail.slideList.length > 0 && presentDetail.slideList.map((slide, index) => {
                            return (
                                <li className="flex mt-2 flex-col" key={slide.slideId} onClick={() => onChangeSlide(index)}>

                                    <div className="flex">
                                        <p>{index + 1}</p>
                                        {
                                            slide.slideId === currentSlide.slideId
                                                ? <div className="flex flex-col justify-center bg-white border border-black cursor-pointer h-24 w-40 rounded-lg shadow ml-2">
                                                    <p className="text-xs text-center">{slide?.heading}</p>
                                                </div>
                                                : <div className="flex flex-col justify-center bg-white border hover:border-black cursor-pointer h-24 w-40 rounded-lg shadow ml-2">
                                                    <p className="text-xs text-center">{slide?.heading}</p>
                                                </div>
                                        }
                                        <div className="ml-2">
                                            <span onClick={(e) => handleDeleteSlide(e, slide.slideId)} className=" cursor-pointer hover:text-red-500 disabled:hover:text-red-500 disabled:opacity-50">X</span>
                                        </div>
                                    </div>


                                </li>
                            )
                        })}

                    </ul>
                </div>
                <div className="flex basis-2/4 bg-gray-200 px-8 py-10 pb-20 mx-4 h-[70vh]">
                    <div className="border w-full h-full bg-white">
                        <div className="mt-8 ml-4 mb-4 text-xl font-bold">{currentSlide?.heading}</div>
                        {
                            currentSlide?.optionList.length > 0 &&
                            <BarChart
                                width={730}
                                height={250}
                                data={currentSlide?.optionList}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                <XAxis dataKey="optionName" />
                                <Bar dataKey="vote" fill="#8884d8">
                                    <LabelList dataKey="vote" position="top" />
                                </Bar>
                            </BarChart>
                        }

                    </div>
                </div>
                <div className="flex basis-2/5 flex-col px-4 py-2">
                    <div className="flex flex-col border-b pb-8">
                        <span className="font-bold"> Slide type</span>
                        <select className="px-4 py-2 mt-2 outline-none">
                            <option value="multiple">Multiple Choice</option>
                        </select>
                    </div>
                    <div className="flex flex-col mb-4">
                        <label className="font-bold mt-2">Your question</label>
                        <input placeholder="Your question" className="border px-2 py-1 mt-2" value={currentSlide?.heading} onChange={onSlideQuestionChange} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold">Options</span>
                        {currentSlide?.optionList.map((d, index) => {
                            return (
                                <div className="flex mt-2">
                                    <input onChange={e => onChartDataChange(e, index)} value={d.optionName} placeholder="Option" className="border px-2 py-1 grow outline-sky-500" />
                                    <button onClick={e => handleRemoveOption(index)} className="self-center px-2">X</button>
                                </div>
                            )
                        })}

                        <button onClick={handleAddOption} className="border bg-gray-200 hover:bg-gray-300 outline-none mt-4 font-bold rounded px-4 py-2">+ Add Option</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PresentationEdit;