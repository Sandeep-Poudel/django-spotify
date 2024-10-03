import { Button, Heading, Text, VStack } from "@chakra-ui/react";
import { EditIcon, CheckCircleIcon } from "@chakra-ui/icons";
import React, { useEffect } from "react";
import Edit from "../components/Edit";
import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Room({ leaveRoomCallback }) {
    const [votesToSkip, setVotesToSkip] = useState(2);
    const [guestCanPause, setGuestCanPause] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const { roomCode } = useParams();
    const navigate = useNavigate();

    const getRoomDetails = async () => {
        try {
            const response = await axios.get(`/api/get-room?code=${roomCode}`);
            const data = response.data; // Access data directly
            console.log(data, "Room");
            setVotesToSkip(data.votesToSkip); // Ensure correct casing as per API response
            setGuestCanPause(data.guestCanPause);
            setIsHost(data.isHost);
        } catch (error) {
            if (error.response.status === 404) {
                leaveRoomCallback();
                navigate("/");
            }
        }
    };

    const handleLeaveRoom = () => {
        const response = axios.post("/api/leave-room");
        leaveRoomCallback();
        navigate("/");
    };

    const updateShowSettings = () => {
        setShowSettings(!showSettings);
    };

    const handleUpdate = (data) => {
        setGuestCanPause(data.guestCanPause);
        setVotesToSkip(data.votesToSkip);
        setShowSettings(false);
    };

    useEffect(() => {
        getRoomDetails();
    }, []);

    return (
        <VStack
            h={"100vh"}
            w={"100vw"}
            justifyContent={"center"}
            position={"relative"}
        >
            <VStack
                bgColor="gray.100"
                borderRadius={"md"}
                align={"center"}
                w={["100%", "450px", "500px"]}
                py={[6, 8, 9]}
                boxShadow="dark-lg"
                position={"relative"}
            >
                {isHost && (
                    <div onClick={updateShowSettings}>
                        {showSettings ? (
                            <CheckCircleIcon
                                position={"absolute"}
                                top={"10px"}
                                right={"10px"}
                                boxSize={8}
                                color={"gray.500"}
                                _hover={{ color: "gray.700" }}
                                cursor={"pointer"}
                                aria-label={"Close Settings"}
                            />
                        ) : (
                            <EditIcon
                                position={"absolute"}
                                top={"10px"}
                                right={"10px"}
                                boxSize={8}
                                color={"gray.500"}
                                _hover={{ color: "gray.700" }}
                                cursor={"pointer"}
                                aria-label={"Open Settings"}
                            />
                        )}
                    </div>
                )}
                <Heading>Room Code: {roomCode}</Heading>
                {showSettings && (
                    <Edit guestcanpause={guestCanPause} votes={votesToSkip} update={handleUpdate} roomCode={roomCode}/>
                )}
                {!showSettings && (
                    <div>
                        <Text fontSize={"2xl"}>
                            Votes to Skip: {votesToSkip}
                        </Text>
                        <Text fontSize={"2xl"}>
                            Guest Can Pause: {guestCanPause ? "Yes" : "No"}
                        </Text>
                        <Text fontSize={"2xl"}>
                            Is Host: {isHost ? "Yes" : "No"}
                        </Text>
                    </div>
                )}
                <Button colorScheme="red" onClick={handleLeaveRoom}>
                    Leave Room
                </Button>
            </VStack>
        </VStack>
    );
}
export default Room;
