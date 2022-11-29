import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";
import { useEffect } from "react";
import jwt_decode from "jwt-decode";

// Yup schema
const schema = yup.object({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().required("Passowrd is required")
}).required();

function LoginForm() {
    const google = window.google;
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });
    const navigate = useNavigate();

    // Handle response from Google login
    const handleCallBackResponse = async (response) => {
        var userObject = jwt_decode(response.credential);
        // Get access_token from my Backend
        const responseFromBackEnd = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/user/oauth2`, {
            email: userObject.email,
            firstName: userObject.family_name,
            lastName: userObject.given_name,
        })
        // Set access_token and redirect to home page
        localStorage.setItem("access_token", responseFromBackEnd.data?.access_token);
        localStorage.setItem("refresh_token", responseFromBackEnd.data?.refresh_token);
        navigate("/home");
    }

    // Initialize google login (use google identity service)
    useEffect(() => {
        google?.accounts.id.initialize({
            client_id: "500883186769-7fb3cis78p1vsj67emal60beeks3sk3s.apps.googleusercontent.com",
            callback: handleCallBackResponse
        })
        google?.accounts.id.renderButton(
            document.getElementById("signInGoogle"),
            { theme: "filled_blue", size: "large", text: "signin_with", locale: "en_GB" }
        )
    }, [])

    // Handle login with local authentication
    const mutation = useMutation((data) => {

        return axios.postForm(`${process.env.REACT_APP_API_ENDPOINT}/api/login`, {}, {
            params: {
                ...data
            }
        }, {
            headers: { 'content-type': 'application/x-www-form-urlencoded' }
        })
    }
    )
    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    // Authentication with local success
    if (mutation.isSuccess) {
        localStorage.setItem("access_token", mutation.data.data.access_token);
        localStorage.setItem("refresh_token", mutation.data.data.refresh_token);
        // If from joinGroupByLink page navigate to that page
        const fromJoinGroupPage = localStorage.getItem("fromJoinGroup");
        if (fromJoinGroupPage && fromJoinGroupPage.length > 10) {
            navigate(fromJoinGroupPage);
        } else {
            navigate("/home");
        }
    }
    return (
        // Login form
        <form onSubmit={handleSubmit(onSubmit)} className="w-[90vw] sm:w-[80vw] md:max-w-fit mx-auto py-6 px-10 shadow-lg border rounded bg-white absolute top-[50%] left-[50%] -translate-y-1/2 -translate-x-1/2">
            <p className="text-center">Sign In Form</p>
            {mutation.isError && <p className="border border-red-500 text-red-500 p-2 text-center my-2">{mutation.error.response?.data?.message || mutation.error.message}</p>}
            <div className="flex flex-col">
                <label htmlFor="email">Email</label>
                <input name="email" type="text" className="min-w-[30vw] px-4 py-2 rounded mb-1 mt-2 border border-gray-400 outline-cyan-300" {...register("email")} placeholder="Email" />
                <p className="mb-4 text-red-500">{errors.email?.message}</p>
            </div>

            <div className="flex flex-col">
                <label htmlFor="password">Password</label>
                <input name="password" type="password" className="min-w-[30vw] px-4 py-2 rounded mb-1 mt-2 border border-gray-400 outline-cyan-300" {...register("password")} placeholder="Password" />
                <p className="mb-4 text-red-500">{errors.password?.message}</p>
            </div>
            <button type="submit" className={mutation.isLoading ? "py-1 rounded w-full text-center bg-green-300 block" : "py-1 rounded w-full text-center bg-green-400 block hover:bg-green-300"}>Sign in</button>
            <Link className="text-center mb-2 mt-4 block w-full underline" to="/register">Create Account</Link>
            <div className="flex justify-center">
                <div id="signInGoogle">Login with Google</div>
            </div>
        </form>
    );
}

export default LoginForm;