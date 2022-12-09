import { useState } from "react";

function Presentation() {
    const [slideQuestion, setSlideQuestion] = useState("Multiple choice")
    const [slideList, setSlideList] = useState([1, 2, 3, 4, 5])
    const onSlideQuestionChange = (e) => {
        setSlideQuestion(e.target.value);
    }
    return (
        <div className="mb-8 -mx-16">
            <div className="flex justify-between">
                <button className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50">New Slide</button>
                <button className="rounded px-4 py-2 bg-[#61dafb] shadow-2xl hover:shadow-xl hover:bg-[#61fbe2] disabled:hover:bg-[#61dafb] disabled:hover:shadow-none disabled:opacity-50">Present</button>
            </div>

            <div className="flex grow ">
                <div>
                    <ul>
                        {slideList.map((slide, index) => {
                            return (
                                <li className="flex mt-4" key={index}>
                                    <p>{index + 1}</p>
                                    <div className="bg-white border hover:border-black cursor-pointer h-24 w-40 rounded-lg shadow ml-2"></div>
                                </li>
                            )
                        })}

                    </ul>
                </div>
                <div className="flex basis-2/4 bg-gray-200 px-8 py-10 pb-20 mx-4 h-[70vh]">
                    <div className="border w-full h-full bg-white">
                        <div className="mt-8 ml-4">{slideQuestion}</div>
                    </div>
                </div>
                <div className="flex basis-2/5 flex-col px-4 py-2">
                    <div className="flex flex-col">
                        Slide type
                        <select>
                            <option value="multiple">Multiple Choice</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label>Your question</label>
                        <input placeholder="Your question" className="border px-2 py-1" value={slideQuestion} onChange={onSlideQuestionChange} />
                    </div>
                    <div className="flex flex-col">
                        <span>Options</span>
                        <input placeholder="Your question" className="border px-2 py-1" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Presentation;