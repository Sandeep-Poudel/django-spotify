import React, { useState, useEffect } from "react";
import {
    Button,
    Image,
    Heading,
    VStack,
    HStack,
    Text,
    Progress,
    IconButton,
} from "@chakra-ui/react";
import { FaPlay, FaPause, FaForward } from "react-icons/fa";
import axios from "axios";

function MusicPlayer({
    title,
    artist,
    imageUrl,
    duration = 500000, // duration in seconds
    time = 400000, // current time in seconds
    isPlaying,
    votes,
    votesToSkip,
    id,
}) {
    const [playing, setPlaying] = useState(isPlaying);
    const [progress, setProgress] = useState(0);

    // Function to handle play/pause toggling
    const togglePlayPause = () => {
        setPlaying(!playing);
    };

    const handleButtonClick = () => {
        if (playing) {
            pausesong();
        } else {
            playsong();
        }
        togglePlayPause();
    };
    // Update the progress bar based on the current time and duration
    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setProgress((prevProgress) => {
                    const currentProgress = (time / duration) * 100;
                    return currentProgress; // Update the progress percentage
                });
            }, 1000); // Update every second

            return () => clearInterval(interval); // Clean up on component unmount
        }
    }, [isPlaying, time, duration]);

    // Format time (in seconds) into MM:SS format
    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `${minutes}:${
            remainingSeconds < 10 ? "0" : ""
        }${remainingSeconds}`;
    };

    const playsong = async () => {
        console.log("Playing song");
        const res = await axios.put(
            "/spotify/play",
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    };

    const pausesong = async () => {
        console.log("Pausing song");
        const res = await axios.put(
            "/spotify/pause",
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    };

    const handleSkip = async () => {
        console.log("Skipping song");
        const res = await axios.post(
            "/spotify/skip",
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    };

    return (
        <VStack
            bgColor="gray.800"
            borderRadius={"md"}
            align={"center"}
            w={["300px", "350px", "400px"]}
            h={"auto"}
            py={[6, 8, 9]}
            boxShadow="lg"
            position={"relative"}
            color="white"
            spacing={4}
        >
            {/* Album Art */}
            <Image
                src={imageUrl}
                alt="Album Art"
                boxSize="200px"
                borderRadius="md"
            />

            {/* Song Title and Artist */}
            <Heading size="md" textAlign="center" fontWeight="semibold">
                {title}
            </Heading>
            <Text fontSize="lg" color="gray.300" textAlign="center">
                {artist}
            </Text>

            {/* Progress Bar */}

            {/* Time Display */}
            <HStack spacing={2} fontSize="sm" color="gray.400" w={"80%"}>
                <Text>{formatTime(time)}</Text> {/* Formatted current time */}
                <Progress
                    value={progress}
                    hasStripe
                    isAnimated
                    colorScheme="teal"
                    w="80%"
                    size="sm"
                />
                <Text>{formatTime(duration)}</Text> {/* Formatted duration */}
            </HStack>

            {/* Play/Pause Button */}
            <HStack>
                <IconButton
                    icon={playing ? <FaPause /> : <FaPlay />}
                    onClick={handleButtonClick}
                    colorScheme={playing ? "red" : "green"}
                    variant="solid"
                    boxSize="50px"
                    isRound
                    aria-label={playing ? "Pause" : "Play"}
                />
                <IconButton
                    icon={<FaForward />}
                    onClick={handleSkip}
                    colorScheme="blue"
                    variant="solid"
                    boxSize="50px"
                    isRound
                    aria-label="Skip"
                />
                <p>
                    {votes}/{votesToSkip}
                </p>
            </HStack>
        </VStack>
    );
}

export default MusicPlayer;
