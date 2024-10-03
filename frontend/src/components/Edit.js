import React from "react";
import {
    VStack,
    HStack,
    Switch,
    Divider,
    Text,
    Input,
    Button,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";

function Edit({ guestcanpause, votes,update ,roomCode}) {
    const [guestCanPause, setGuestCanPause] = useState(guestcanpause);
    const [votesToSkip, setVotesToSkip] = useState(votes);
    const [error, setError] = useState(null);
    const fontSize = "xl";

    const handleVotesChange = (e) => {
        setVotesToSkip(e.target.value);
        console.log(votesToSkip);
    };

    const handleToggle = (e) => {
        setGuestCanPause(e.target.checked);
        console.log(guestCanPause);
    };

    const preventEnterSubmission = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await axios.patch("/api/update-room", {
                code: roomCode,
                votesToSkip: votesToSkip,
                guestCanPause: guestCanPause,
            });
            const data = response.data;
            console.log(data);
            update(data);
        }
        catch (error) {
            setError("Error updating room");
            console.log("Error updating room:", error);
        }

    }

    return (
        <VStack boxShadow="inset 0 0 10px rgba(0, 0, 0, 0.5)" p={8} >
            <Divider borderWidth={"1.5px"} borderColor="gray.300" />

            <Text as="label" color={"gray.700"} fontSize={fontSize}>
                Allow guests to play/pause music?
            </Text>
            <HStack justifyContent={"center"} w={"100%"}>
                <Text
                    as="label"
                    color={"gray.700"}
                    fontWeight={"semibold"}
                    fontSize={fontSize}
                >
                    No
                </Text>
                <Switch
                    colorScheme="blue"
                    size={"lg"}
                    isChecked={guestCanPause}
                    onChange={handleToggle}
                    onKeyDown={preventEnterSubmission}
                />
                <Text
                    as="label"
                    color={"gray.700"}
                    fontWeight={"semibold"}
                    fontSize={fontSize}
                >
                    Yes
                </Text>
            </HStack>
            <Divider borderWidth={"1.5px"} borderColor="gray.300" />
            <VStack w={"100%"} >
                <HStack>
                    <Text as="label" htmlFor="votes" fontSize={fontSize}>
                        Votes to skip:
                    </Text>
                    <Input
                        id="votes"
                        value={votesToSkip}
                        w={"80px"}
                        type="number"
                        onChange={handleVotesChange}
                        min={1}
                    />
                </HStack>
            </VStack>
            {error && (<Text color="red.500">{error}</Text>)}
            <Divider borderWidth={"1.5px"} borderColor="gray.300" />
            <Button colorScheme="blue" onClick={handleUpdate}>Update Room</Button>
        </VStack>
    );
}
export default Edit;
