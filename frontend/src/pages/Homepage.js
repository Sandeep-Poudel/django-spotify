import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { ButtonGroup, Heading, VStack, Button } from "@chakra-ui/react";
import BackBlur from "../components/BackBlur";
import image from "../assets/home.jpeg";
import { Routes, Route } from "react-router-dom";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";
import Room from "./Room";

function Homepage() {
    const [roomCode, setRoomCode] = useState(null);
    const navigate = useNavigate();
    const fetchUserInRoom = useCallback(async () => {
        try {
            const response = await axios.get("/api/user-in-room");
            const data = response.data;
            console.log(data.code, "homepage");
            if (data.code != null) {
                setRoomCode(data.code);
            }
        } catch (error) {
            console.error("Error fetching user in room:", error);
        }
    }, []);

    useEffect(() => {
        fetchUserInRoom();
    }, [fetchUserInRoom]);

    const clearRoom = () => {
        setRoomCode(null);
    };

    if (
        (location.pathname === "/" ||
            location.pathname === "/join" ||
            location.pathname === "/create") &&
        roomCode
    ) {
        navigate(`/room/${roomCode}`);
    }

    const home = (
        <VStack justifyContent={"center"} h={"100vh"}>
            <BackBlur image={image} />
            <VStack
                bgColor="rgba(229, 229, 229, 0.96)" // Equivalent to gray.200 with 80% opacity
                borderRadius={"md"}
                align={"center"}
                w={["100%", "400px", "450px"]}
                py={[6, 8, 9]}
                boxShadow="dark-lg"
                spacing={"90px"}
            >
                <Heading fontSize={"5xl"}>Homepage</Heading>
                <ButtonGroup>
                    <Button
                        onClick={() => navigate("/join")}
                        colorScheme="blue"
                    >
                        Join Room
                    </Button>
                    <Button
                        onClick={() => navigate("/create")}
                        boxShadow={"2xl "}
                        colorScheme="green"
                    >
                        Create Room
                    </Button>
                </ButtonGroup>
            </VStack>
        </VStack>
    );

    return (
        <Routes>
            <Route path="/" exact element={home} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route
                path="/room/:roomCode"
                index
                element={<Room leaveRoomCallback={clearRoom} />}
            />
        </Routes>
    );
}
export default Homepage;
