import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BsFillCalendarCheckFill } from "react-icons/bs";
import { FaUserAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { refreshAccessToken } from "../utils/auth";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";

export default function PresentationCoList() {
    /* Component State */
    const [inviteMail, setInviteMail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [coList, setCoList] = useState([]);
    const [presentDetail, setPresentDetail] = useState({
        presentId: "",
        createdAt: "",
        presentName: "",
        slideList: [],
    });
    const [groupOwner, setGroupOwner] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    /**/
    const navigate = useNavigate();
    const params = useParams();

    // Toast success copied invite link
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
    async function callApiGetColist(presentId) {
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get(
            `${process.env.REACT_APP_API_ENDPOINT}/api/presents/${presentId}/coList`,
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );
    }

    // Get group info, do some validate
    async function getColist() {
        const currentPresentId = presentDetail.presentId;
        if (currentPresentId == null) {
            return;
        }
        try {
            await callApiGetColist(currentPresentId);
        } catch (error) {
            await callApiGetColist(currentPresentId);
        }
    }

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

    useEffect(() => {
        getPresentDetail();
    }, [navigate]);

    // On input mail invite change
    const onInviteMailChange = (e) => {
        setInviteMail(e.target.value);
        if (e.target.value.length < 1) {
            setErrorMessage("Email is required");
            return;
        }
        let pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        let result = pattern.test(e.target.value);
        if (!result) {
            setErrorMessage("Invali email format");
            return;
        }
        setErrorMessage("");
    };

    const handleSendInviteLink = async (e) => {
        // Do some validate
        const accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }

        if (inviteMail.length < 1) {
            setErrorMessage("Email is required");
            return Promise.reject();
        }
        let pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        let result = pattern.test(inviteMail);
        if (!result) {
            setErrorMessage("Invali email format");
            return Promise.reject();
        }

        try {
            e.target.disabled = true;
            await callApiSendInviteMail();
            e.target.disabled = false;
        } catch (error) {
            await refreshAccessToken();
            await callApiSendInviteMail();
            e.target.disabled = false;
        }
        //setShowSendMailResult(true);
    };

    // Call api send invite mail
    async function callApiSendInviteMail() {
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.post(
            `${process.env.REACT_APP_API_ENDPOINT}/api/groups/invite`,
            {
                memberEmail: inviteMail,
                presentId: presentDetail.presentId,
            },
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );
        if (response.status === 200) {
            return Promise.resolve();
        }
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
        <div>
            <div className="flex">
                <div>
                    <div className="font-bold text-2xl mb-4">
                        <span className="bg-[#61dafb] px-4 py-2 rounded-full uppercase mr-2">
                            {presentDetail.presentName[0]}
                        </span>
                        <span className="italic">
                            {presentDetail.presentName}
                        </span>
                    </div>
                    <div className="italic mb-4 flex pt-4">
                        <BsFillCalendarCheckFill
                            className="self-center mr-2"
                            size={25}
                        />
                        <span className="font-bold mr-2">Created At:</span>{" "}
                        {new Date(presentDetail.createdAt)
                            .toString()
                            .slice(0, 24)}
                    </div>
                </div>
            </div>
            <div className="italic mb-4 flex">
                <div className="flex mr-8">
                    <FaUserAlt size={20} className="mr-2" />
                    <span className="font-bold mr-2">Owner By:</span>{" "}
                    {groupOwner.lastName + " " + groupOwner.firstName}
                </div>
                <div className="flex">
                    <MdEmail size={25} className="mr-2" />
                    <span className="font-bold mr-2">Email:</span>{" "}
                    {groupOwner.email}
                </div>
            </div>
            <div className="flex flex-col mb-4">
                <div className="flex">
                    <input
                        onChange={(e) => {
                            onInviteMailChange(e);
                        }}
                        value={inviteMail}
                        className="px-4 py-2 border rounded focus:border-cyan-300 outline-none shadow-2xl"
                        placeholder="Member's email"
                    />
                    <button
                        onClick={(e) =>
                            toast.promise(
                                async () => await handleSendInviteLink(e),
                                {
                                    pending: "Sending invite link",
                                    success: "Send invite link success 👌",
                                    error: "Send invite link failed  🤯",
                                },
                                {
                                    className: "mt-10",
                                }
                            )
                        }
                        className="ml-4 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb] disabled:hover:bg-[#61dafb] disabled:opacity-50"
                    >
                        Invite Collaborator By Email
                    </button>
                </div>
            </div>

            <div className="font-bold text-2xl mb-2">Collaborators</div>
            <table className="w-full shadow-xl px-4 py-2">
                <thead>
                    <tr className="uppercase text-left border-b">
                        <th className="px-4 py-2">Index</th>
                        <th>Firstname</th>
                        <th>Lastname</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {coList.length > 0 &&
                        coList.map((m, index) => {
                            return (
                                <tr
                                    key={m.userId}
                                    className="text-left border-b"
                                >
                                    <td className="px-4 py-4">{index + 1}</td>
                                    <td className=" py-4">{m.firstName}</td>
                                    <td className=" py-4">{m.lastName}</td>
                                    <td className=" py-4">{m.email}</td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
            <button
                onClick={() => navigate("/home")}
                className="mt-4 rounded px-4 py-2 shadow-xl hover:bg-[#61fbe2] bg-[#61dafb]"
            >
                Return home
            </button>
        </div>
    );
}
