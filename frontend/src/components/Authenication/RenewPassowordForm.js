import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";

// Yup schema
const schema = yup
    .object({
        password: yup.string().required("Passowrd is required"),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref("password"), null], "Passwords must match"),
    })
    .required();

function RenewPasswordForm() {
    const params = useParams();
    const token = params.token;
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    // Handle login with local authentication
    const mutation = useMutation((data) => {
        return axios.post(
            `${process.env.REACT_APP_API_ENDPOINT}/api/user/renewPassword`,
            {
                token,
                newPassword: data.password,
            }
        );
    });
    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        // Login form
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-[90vw] sm:w-[80vw] md:max-w-fit mx-auto py-6 px-10 shadow-lg border rounded bg-white absolute top-[50%] left-[50%] -translate-y-1/2 -translate-x-1/2"
        >
            <p className="text-center font-bold">KahooClone</p>
            {mutation.isError && (
                <p className="border border-red-500 text-red-500 p-2 text-center my-2">
                    {mutation.error.response?.data?.message ||
                        mutation.error.message}
                </p>
            )}
            {mutation.isSuccess && (
                <p className="border border-green-500 text-green-500 p-2 text-center my-2">
                    Renew Password Success
                </p>
            )}
            <div className="flex flex-col">
                <label htmlFor="password">Password</label>
                <input
                    name="password"
                    type="password"
                    className="min-w-[30vw] px-4 py-2 rounded mb-1 mt-2 border border-gray-400 outline-cyan-300"
                    {...register("password")}
                    placeholder="Password"
                />
                <p className="mb-4 text-red-500">{errors.password?.message}</p>
            </div>
            <div className="flex flex-col">
                <label htmlFor="email">ConfirmPassword</label>
                <input
                    name="confirmPassword"
                    type="password"
                    className="min-w-[30vw] px-4 py-2 rounded mb-1 mt-2 border border-gray-400 outline-cyan-300"
                    {...register("confirmPassword")}
                    placeholder="ConfirmPassword"
                />
                <p className="mb-4 text-red-500">
                    {errors.confirmPassword?.message}
                </p>
            </div>

            <button
                type="submit"
                className={
                    mutation.isLoading
                        ? "flex items-center justify-center py-1 rounded w-full text-center bg-green-300 block"
                        : "flex items-center justify-center py-1 rounded w-full text-center bg-green-400 block hover:bg-green-300"
                }
            >
                {mutation.isLoading && (
                    <span className="animate-spin inline-block h-4 w-4 border border-4 mr-2"></span>
                )}
                Submit
            </button>
            <div className="flex">
                <Link
                    className="text-center mb-2 mt-4 block w-full underline"
                    to="/"
                >
                    Return home
                </Link>

                <Link
                    className="text-center mb-2 mt-4 block w-full underline"
                    to="/login"
                >
                    Login
                </Link>
            </div>
        </form>
    );
}

export default RenewPasswordForm;
