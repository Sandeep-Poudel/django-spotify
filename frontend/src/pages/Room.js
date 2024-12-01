import { Button, Heading, Text, VStack } from "@chakra-ui/react";
import { EditIcon, CheckCircleIcon } from "@chakra-ui/icons";
import React, { useEffect } from "react";
import Edit from "../components/Edit";
import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MusicPlayer from "../components/MusicPlayer";
import BackBlur from "../components/BackBlur";

function Room({ leaveRoomCallback }) {
    const [votesToSkip, setVotesToSkip] = useState(2);
    const [guestCanPause, setGuestCanPause] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
    const [song, setSong] = useState({});
    const { roomCode } = useParams();
    const navigate = useNavigate();

    const getRoomDetails = async () => {
        try {
            const response = await axios.get(`/api/get-room?code=${roomCode}`);
            const data = response.data; // Access data directly
            setVotesToSkip(data.votesToSkip); // Ensure correct casing as per API response
            setGuestCanPause(data.guestCanPause);
            setIsHost((prev) => data.isHost);
        } catch (error) {
            if (error.response.status === 404) {
                leaveRoomCallback();
                navigate("/");
            }
        }
    };
    const authenticateSpotify = async () => {
        const response = await axios.get(`/spotify/is-authenticated`);
        const data = response.data;
        setSpotifyAuthenticated(data.status);
        if (!data.status) {
            const resp = await axios.get("/spotify/get-auth-url");
            const url = resp.data.url;
            print(url);
            window.location.replace(url);
        }
        console.log(data, "authenticateSpotify");
        return data;
    };

    const getCurrentSong = async () => {
        try {
            const response = await axios.get("/spotify/current-song");
            const data = response.data;
            setSong(data);
            console.log("Current song:", data);
        } catch (error) {
            console.error("Error fetching current song:", error);
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
        if (isHost) {
            console.log("Authenticating Spotify as host...");
            authenticateSpotify();
        }
    }, [isHost]);

    useEffect(() => {
        getRoomDetails();
    }, []);

    useEffect(() => {
        const interval = setInterval(getCurrentSong, 2000);
        return () => clearInterval(interval);
    }, [spotifyAuthenticated]);

    return (
        <VStack
            h={"100vh"}
            w={"100vw"}
            justifyContent={"center"}
            position={"relative"}
        >
            {song.image_url && <BackBlur image={song.image_url} />}
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
                    <Edit
                        guestcanpause={guestCanPause}
                        votes={votesToSkip}
                        update={handleUpdate}
                        roomCode={roomCode}
                    />
                )}
                {!showSettings && (
                    <MusicPlayer
                        title={song.title}
                        artist={song.artist}
                        duration={song.duration}
                        time={song.time}
                        imageUrl={song.image_url}
                        isPlaying={song.is_playing}
                        votes={song.votes}
                        votesToSkip={song.votesToSkip}
                        id={song.id}
                    />
                )}
                <Button colorScheme="red" onClick={handleLeaveRoom}>
                    Leave Room
                </Button>
            </VStack>
        </VStack>
    );
}
export default Room;
