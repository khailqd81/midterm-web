import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    BarChart, Bar, LabelList, XAxis
} from 'recharts';
import ReactLoading from "react-loading";
import axios from "axios";
import { useSocket } from "./customHook/useSocket";

function SlidePresent() {
    const { isConnected, socketResponse, sendData } = useSocket("public", "khai" + Math.random());
    const [slideDetail, setSlideDetail] = useState({
        slideId: "",
        heading: "",
        optionList: []
    })
    const [isLoading, setIsLoading] = useState(true);
    const [answer, setAnswer] = useState({
        optionName: "",
        optionId: ""
    });
    const navigate = useNavigate();
    const params = useParams();
    // Call api group information
    async function callApiSlideDetail() {
        const slideId = params.slideId;
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/slides/${slideId}`)

        if (response.status === 200) {
            let newSlideDetail = response.data.slide
            newSlideDetail.optionList.sort((a, b) => a.optionId - b.optionId)
            setSlideDetail(newSlideDetail);
        }
        setIsLoading(false)
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
    }, [socketResponse, params.slideId, navigate])

    const onInputChange = (e, optionId) => {
        setAnswer({
            optionName: e.target.value,
            optionId: optionId
        })
    }


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
        e.preventDefault()
        // console.log({
        //     slideId: slideDetail.slideId,
        //     option: answer
        // })
        sendData({
            slideId: slideDetail.slideId,
            option: answer
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
    }

    if (isLoading) {
        return (<div className="mx-auto h-[100vh] relative">
            <ReactLoading className="fixed mx-auto top-[50%] left-[50%] -translate-x-2/4 -translate-y-1/2" type="spin" color="#7483bd" height={100} width={100} />
        </div>)
    }

    return (
        <div>
        <h1 className="font-bold text-6xl text-center mt-4 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-pink-500">KahooClone</h1>
        <div className="flex justify-between flex-col md:flex-row px-8 py-10 pb-20 mx-4 h-[70vh] ">
            <div className="basis-1/2 border w-full h-full bg-white shadow-xl rounded-lg">
                <div className="mt-8 ml-4 mb-4 text-xl font-bold">{slideDetail?.heading}</div>
                {
                    slideDetail?.optionList.length > 0 &&
                    <BarChart
                        width={730}
                        height={250}
                        data={slideDetail?.optionList}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <XAxis dataKey="optionName" />
                        <Bar dataKey="vote" fill="#8884d8">
                            <LabelList dataKey="vote" position="top" />
                        </Bar>
                    </BarChart>
                }

            </div>
            <form className="bg-white h-full shadow-xl rounded-lg px-8 py-4" onSubmit={(e) => handleSubmitForm(e)}>
                <div className="font-bold text-xl">Select option:</div>
                {slideDetail?.optionList.length > 0 ?
                    slideDetail?.optionList.map(opt => {
                        return (
                            <div className="border">
                                <input
                                    id={opt.optionId}
                                    name="option"
                                    type="radio"
                                    value={opt.optionName}
                                    onChange={e => onInputChange(e, opt.optionId)}
                                    checked={opt.optionName === answer.optionName && opt.optionId === answer.optionId}

                                />
                                <label htmlFor={opt.optionId}>{opt.optionName}</label>
                            </div>
                        )
                    })
                    :
                    <div></div>
                }

                <button type="submit">Submit</button>
            </form>
        </div>
        </div>
    )
}

export default SlidePresent;