import { useCallback, useEffect, useRef, useState } from "react";
import * as io from "socket.io-client";

export const useSocket = (room, username) => {
    const [socket, setSocket] = useState();
    const [socketResponse, setSocketResponse] = useState({
        room: "",
        username: "",
        option: "",
        slideId: ""
        // messageType: "",
        // createdDateTime: "",
    });
    const [isConnected, setIsConnected] = useState(false);

    const sendData = useCallback(
        (payload) => {
            socket.emit("send_vote", {
                room: room,
                username: username,
                option: payload.option,
                slideId: payload.slideId
                //messageType: "CLIENT",
            });
        },
        [socket, room]
    );

    useEffect(() => {
        // console.log(`${process.env.REACT_APP_API_ENDPOINT}`)

        const s = io("http://localhost:8085", {
            reconnection: false,
            query: `username=${username}&room=${room}`, //"room=" + room+",username="+username,
        });


        s.on("connect", () => {
            console.log("connect success")
            setIsConnected(true)
        }
        );
       setSocket(s);


        s.on("read_message", (res) => {
            console.log("res:", res);
            setSocketResponse({
                room: res.room,
                username: res.username,
                option: res.option,
                slideId: res.slideId
                // content: res.content,
                // messageType: res.messageType,
                // createdDateTime: res.createdDateTime,
            });
        });

        return () => {
            console.log("disconnect")
            s.disconnect();
        };

    }, [room]);
    return { socketResponse, isConnected, sendData };
};