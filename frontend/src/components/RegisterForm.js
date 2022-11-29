import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";

// Yup schema
const schema = yup.object().shape({
    password: yup.string().required("is required"),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match'),
    email: yup.string().email("invalid email format").required("is required"),
}).required();

function RegisterForm() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });
    const navigate = useNavigate();

    // Handle register new user
    const mutation = useMutation((data) => {
        return axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/user/register`, { ...data, roles: [data.roles] });
    })
    const onSubmit = (data) => {
        mutation.mutate(data)
    };

    if (mutation.isSuccess) {
        navigate("/");
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-fit mx-auto my-4 py-6 px-10 shadow-lg border rounded bg-white absolute left-[50%] -translate-x-1/2">
            <p className="text-center">Sign Up Form</p>
            {mutation.isError && <p className="border border-red-500 text-red-500 p-2 text-center my-2">{mutation.error.response?.data?.message || mutation.error.message}</p>}

            <div className="flex flex-col">
                <label htmlFor="email">Email</label>
                <input name="email" type="text" className="min-w-[30vw] px-4 py-2 rounded mb-1 mt-2 border border-gray-400 outline-cyan-300" {...register("email")} placeholder="Email" />
                <p className="mb-4 text-red-500 text-sm">{errors.email?.message}</p>
            </div>

            <div className="flex flex-col">
                <label htmlFor="password">Password</label>
                <input name="password" type="password" className="min-w-[30vw] px-4 py-2 rounded mb-1 mt-2 border border-gray-400 outline-cyan-300" {...register("password")} placeholder="Password" />
                <p className="mb-4 text-red-500 text-sm">{errors.password?.message}</p>
            </div>
            <div className="flex flex-col">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input name="confirmPassword" type="password" className="min-w-[30vw] px-4 py-2 rounded mb-1 mt-2 border border-gray-400 outline-cyan-300" {...register("confirmPassword")} placeholder="Confirm Password" />
                <p className="mb-4 text-red-500 text-sm">{errors.confirmPassword?.message}</p>
            </div>
            <div className="flex flex-col">
                <label htmlFor="firstName">Firstname</label>
                <input name="firstName" type="text" className="min-w-[30vw] px-4 py-2 rounded mb-1 mt-2 border border-gray-400 outline-cyan-300" {...register("firstName")} placeholder="Firstname" />
            </div>
            <div className="flex flex-col">
                <label htmlFor="lastName">Lastname</label>
                <input name="lastName" type="text" className="min-w-[30vw] px-4 py-2 rounded mb-1 mt-2 border border-gray-400 outline-cyan-300" {...register("lastName")} placeholder="Lastname" />
            </div>

            <button type="submit" className={mutation.isLoading ? "py-1 rounded w-full text-center bg-green-300 block mt-4" : "py-1 rounded w-full text-center bg-green-400 block hover:bg-green-300 mt-4"}>Sign up</button>
            <Link className="text-center mb-2 mt-4 block w-full underline" to="/login">Login</Link>
        </form>
    );
}

export default RegisterForm;