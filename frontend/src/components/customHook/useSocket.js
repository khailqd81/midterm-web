import { useCallback, useEffect, useState } from "react";
//import * as io from "socket.io-client";
import { io } from "socket.io-client";
export const useSocket = (room, username) => {
    const [socket, setSocket] = useState();
    const [socketResponse, setSocketResponse] = useState({
        // room: "",
        // username: "",
        // option: "",
        // slideId: "",
        // // messageType: "",
        // // createdDateTime: "",
    });
    const [isConnected, setIsConnected] = useState(false);

    const sendData = useCallback(
        (payload) => {
            socket.emit(payload.eventName, {
                room: room,
                username: username,
                ...payload.data,
            });
            // if (payload.eventName === "send_update") {
            //     //console.log(payload.slide)
            //     socket.emit("send_update", {
            //         room: room,
            //         username: username,
            //         slide: payload.slide,
            //         //messageType: "CLIENT",
            //     });
            // } else {
            //     socket.emit("send_vote", {
            //         room: room,
            //         username: username,
            //         option: payload.option,
            //         slideId: payload.slideId,
            //         //messageType: "CLIENT",
            //     });
            // }
        },
        [socket, room]
    );

    useEffect(() => {
        // console.log(`${process.env.REACT_APP_API_ENDPOINT}`)

        const s = io(`${process.env.REACT_APP_API_ENDPOINT_SOCKET}`, {
            reconnection: false,
            query: `username=${username}&room=${room}`, //"room=" + room+",username="+username,
            withCredentials: false,
        });

        s.on("connect", () => {
            console.log(`connect success ${room}`);
            setIsConnected(true);
        });
        setSocket(s);
        s.on("present_group", (res) => {
            console.log("res present group:", res);
            setSocketResponse({
                ...res,
            });
        });
        s.on("read_message", (res) => {
            console.log("res:", res);
            setSocketResponse({
                ...res,
                // room: res.room,
                // username: res.username,
                // slide: res?.slide,
                // option: res?.option,
                // slideId: res?.slideId,
                // content: res.content,
                // messageType: res.messageType,
                // createdDateTime: res.createdDateTime,
            });
        });

        return () => {
            console.log("disconnect");
            s.disconnect();
        };
    }, [room]);
    return { socketResponse, isConnected, sendData };
};
