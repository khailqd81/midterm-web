import { useCallback, useEffect, useRef, useState } from "react";
import * as io from "socket.io-client";

export const useSocket = (room, username) => {
    const [socket, setSocket] = useState();
    const [socketResponse, setSocketResponse] = useState({
        room: "",
        content: "",
        username: "",
        messageType: "",
        createdDateTime: "",
    });
    const [isConnected, setIsConnected] = useState(false);

    const sendData = useCallback(
        (payload) => {
            console.log("payLoad:", payload)
            console.log(socket)
            console.log(isConnected)
            socket.emit("send_message", {
                room: room,
                content: payload.content + Math.random(),
                username: username,
                messageType: "CLIENT",
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

        console.log("socke in useEffec:", s)

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
                content: res.content,
                username: res.username,
                messageType: res.messageType,
                createdDateTime: res.createdDateTime,
                optionName: res.optionName,
                optionId: res.optionId,
                vote: res.vote
            });
        });

        return () => {
            console.log("disconnect")
            s.disconnect();
        };

    }, [room]);
    return { socketResponse, isConnected, sendData };
};