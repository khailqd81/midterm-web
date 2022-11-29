import { Link } from "react-router-dom";

function PageNotFound() {
    return (
        <div className="max-w-fit mx-auto my-4 py-6 px-10 shadow-lg border rounded-lg bg-white absolute left-[50%] -translate-x-1/2">
            <p className="border border-red-500 text-red-500 p-2 text-center my-2">Page Not Found</p>
            <Link className="text-center mb-2 mt-4 block w-full underline" to="/login">Login</Link>
        </div>
    )
}
{/* <div className="mt-4 text-center text-2xl">Page Not Found</div> */ }
export default PageNotFound;