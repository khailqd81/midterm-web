// async function checkAuth() {
//     if (localStorage.getItem("access_token") === null) {
//         setIsLoading(false);
//         return;
//     }
//     try {
//         const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/isauth`, {
//             headers: { 'Authorization': "Bearer " + localStorage.getItem("access_token") }
//         })

import axios from "axios";

//         if (response.status === 200) {
//             localStorage.setItem("userId", response.data?.userId);
//             localStorage.setItem("email", response.data?.email);
//             localStorage.setItem("firstName", response.data?.firstName);
//             localStorage.setItem("lastName", response.data?.lastName);
//         }
//         return response;
//     } catch (error) {
//         return response;
//     }
// }

const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    // try {

    //     return true;
    // } catch (error) {
    //     return false;
    // }

    const response = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/user/refreshToken`,
        {
            headers: { Authorization: refreshToken },
        }
    );

    if (response.status === 200) {
        localStorage.setItem("access_token", response.data.access_token);
    }
};

export { refreshAccessToken };
