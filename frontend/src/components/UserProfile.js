import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineUser } from "react-icons/ai"
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useMutation } from "react-query";
import { AiFillCheckCircle } from "react-icons/ai"
import { refreshAccessToken } from "./utils/auth"

const phoneRegExp = /^(\s*|[0-9]{10})$/
const schema = yup.object().shape({
    firstName: yup.string().required("is required"),
    lastName: yup.string().required("is required"),
    gender: yup.string().required("is required"),
    phone: yup.string().notRequired()
        .matches(phoneRegExp, 'Phone number is not valid')
        .min(10, "too short")
        .max(10, "too long").nullable().transform((value) => !!value ? value : null),
    // birthday: yup.date("Date format dd/MM/yyyy").notRequired()
    //     .transform((value, originalValue) => {
    //         const parsedDate = isDate(originalValue)
    //             ? originalValue
    //             : parse(originalValue, "dd/MM/yyyy", new Date());
    //         return parsedDate;
    //     })
    //     .max(new Date(), "Future date not allowed"),
    // .nullable()
    // .transform((value) => !!value ? value : null),

}).required();

function UserProfile() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema)
    });
    const navigate = useNavigate();
    const [user, setUser] = useState({
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthday: "",
        address: "",
        gender: ""
    })
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        async function getUserProfile() {
            let accessToken = localStorage.getItem("access_token");
            if (accessToken == null) {
                navigate("/login");
            }
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user`, {
                    headers: { 'Authorization': "Bearer " + accessToken }
                })

                setUser(response.data);
                reset({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    gender: response.data?.gender,
                    phone: response.data?.phone,
                    address: response.data?.address,
                    birthday: response.data?.birthday,
                })
            } catch (error) {
                try {
                    let check = await refreshAccessToken();
                    if (check) {
                        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user`, {
                            headers: { 'Authorization': "Bearer " + localStorage.getItem("access_token") }
                        })
                        if (response.status === 200) {
                            setUser(response.data);
                            reset({
                                firstName: response.data.firstName,
                                lastName: response.data.lastName,
                                email: response.data.email,
                                gender: response.data?.gender,
                                phone: response.data?.phone,
                                address: response.data?.address,
                                birthday: response.data?.birthday,
                            })
                        }
                    }
                } catch (error) {
                    navigate("/login")
                }
            }

        }
        getUserProfile()
    }, [])

    const mutation = useMutation((data) => {
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        return axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/user`, {
            firstName: data.firstName,
            lastName: data.lastName
        }, {
            headers: { 'Authorization': "Bearer " + accessToken }
        });
    }
    )

    const onSubmit = (data) => {
        mutation.mutate(data)
    };

    const handleSubmitForm = async (data) => {
        let accessToken = localStorage.getItem("access_token");
        if (accessToken == null) {
            navigate("/login");
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/user`, {
                firstName: data.firstName,
                lastName: data.lastName
            }, {
                headers: { 'Authorization': "Bearer " + accessToken }
            });
            if (response.status === 200) {
                window.location.reload()
            }
        } catch (error) {
            try {
                let check = await refreshAccessToken();
                if (check) {
                    const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/user`, {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        phone: data?.phone,
                        address: data?.address,
                        gender: data.gender
                    }, {
                        headers: { 'Authorization': "Bearer " +  localStorage.getItem("access_token") }
                    });
                    if (response.status === 200) {
                        window.location.reload()
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

    }
    // if (mutation.isSuccess) {
    //     window.location.reload()
    // }

    // if (mutation.isError) {

    // }

    return (
        <div className="shadow-xl rounded-lg bg-slate-300 py-4 px-8">
            <div className="flex mb-8">
                <div className="border px-2 py-2 rounded-full w-fit bg-[#61dafb]"><AiOutlineUser size={40} /></div>
                <p className="ml-4 self-center font-bold text-xl">User Profile</p>
            </div>
            {
                isEditMode
                    ?
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">UserId</span>
                            <div className="">{user.userId}</div>
                        </div>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">Email</span>
                            <div className="">{user.email}</div>
                            {/* <input name="email" className="px-4 py-2 rounded-lg outline-none border-2 border-white focus:border-cyan-300" {...register("email")} />
                            <p className="ml-4 text-red-500 text-sm">{errors.email?.message}</p> */}
                        </div>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">FirstName</span>
                            <input name="firstName" className="px-4 py-2 rounded-lg outline-none border-2 border-white focus:border-cyan-300"  {...register("firstName")} />
                            <p className="ml-4 text-red-500 text-sm">{errors.firstName?.message}</p>
                        </div>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">LastName</span>
                            <input name="lastName" className="px-4 py-2 rounded-lg outline-none border-2 border-white focus:border-cyan-300" {...register("lastName")} />
                            <p className="text-red-500 text-sm ml-4">{errors.lastName?.message}</p>
                        </div>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">Phone</span>
                            <input name="phone" className="px-4 py-2 rounded-lg outline-none border-2 border-white focus:border-cyan-300" {...register("phone")} />
                            <p className="text-red-500 text-sm ml-4">{errors.phone?.message}</p>
                        </div>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">Address</span>
                            <input name="address" className="px-4 py-2 rounded-lg outline-none border-2 border-white focus:border-cyan-300" {...register("address")} />
                            <p className="text-red-500 text-sm ml-4">{errors.address?.message}</p>
                        </div>
                        {/* <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">Birthday</span>
                            <input name="birthday" className="px-4 py-2 rounded-lg outline-none border-2 border-white focus:border-cyan-300" {...register("birthday")} />
                            <p className="text-red-500 text-sm ml-4">{errors.birthday?.message}</p>
                        </div> */}
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">Gender</span>
                            <div className="flex flex-col">
                                <div className="flex">
                                    <input type="radio" id="male" name="gender" value="m"  {...register("gender")} />
                                    <label htmlFor="male" className="ml-2 mr-8">Male</label>
                                    <input type="radio" id="female" name="gender" value="f"  {...register("gender")} />
                                    <label htmlFor="female" className="ml-2">Female</label>
                                </div>
                            </div>
                            <p className="text-red-500 text-sm ml-4">{errors.gender?.message}</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="mr-4 px-8 py-2 rounded-lg shadow-xl bg-[#61dafb] hover:bg-[#61fbe2] mt-4"
                                onClick={() => setIsEditMode(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-2 rounded-lg shadow-xl bg-[#61dafb] hover:bg-[#61fbe2] mt-4"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                    :
                    <div>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">UserId</span>
                            <div className="">{user.userId}</div>
                            <AiFillCheckCircle size={20} className="self-center text-green-600 ml-auto" />
                        </div>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">Email</span>
                            <div>{user.email}</div>
                            <AiFillCheckCircle size={20} className="self-center text-green-600 ml-auto" />
                        </div>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">FirstName</span>
                            <div>{user.firstName}</div>
                            <AiFillCheckCircle size={20} className="self-center text-green-600 ml-auto" />
                        </div>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">LastName</span>
                            <div>{user.lastName}</div>
                            <AiFillCheckCircle size={20} className="self-center text-green-600 ml-auto" />
                        </div>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">Phone</span>
                            <div>{user.phone}</div>
                            <AiFillCheckCircle size={20} className="self-center text-green-600 ml-auto" />
                        </div>
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">Address</span>
                            <div>{user.address}</div>
                            <AiFillCheckCircle size={20} className="self-center text-green-600 ml-auto" />
                        </div>
                        {/* <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">Birthday</span>
                            <div>{user.birthday}</div>
                            <AiFillCheckCircle size={20} className="self-center text-green-600 ml-auto" />
                        </div> */}
                        <div className="flex py-4 px-8 border-b">
                            <span className="font-bold italic min-w-[200px]">Gender</span>
                            <div>{user.gender === "m" ? "Male" : "Female"}</div>
                            <AiFillCheckCircle size={20} className="self-center text-green-600 ml-auto" />
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="px-8 py-2 rounded-lg shadow-xl bg-[#61dafb] hover:bg-[#61fbe2] mt-4"
                                onClick={() => setIsEditMode(true)}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
            }


        </div>
    )
}

export default UserProfile;