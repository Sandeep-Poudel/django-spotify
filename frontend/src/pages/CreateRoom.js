import React from "react";
import {
    Heading,
    Input,
    VStack,
    HStack,
    Button,
    Text,
    Divider,
    Switch,
    Stack,
} from "@chakra-ui/react";
import { useState } from "react";
import BackBlur from "../components/BackBlur";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateRoom() {
    const [votesToSkip, setVotesToSkip] = useState(2);
    const [guestCanPause, setGuestCanPause] = useState(true);

    const navigate = useNavigate();

    const handleVotesChange = (e) => {
        setVotesToSkip(e.target.value);
        console.log(votesToSkip);
    };

    const handleToggle = (e) => {
        setGuestCanPause(e.target.checked);
        console.log(guestCanPause);
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        const response = await axios.post("/api/create/", {
            votesToSkip,
            guestCanPause,
        });
        const data = response.data;

        console.log(data, "createroom");
        navigate(`/room/${data.code}`);
    };

    const preventEnterSubmission = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };
    return (
        <VStack w={"100vw"} h="100vh" justifyContent="center">
            <BackBlur />
            <VStack
                bgColor="gray.100"
                borderRadius={"md"}
                align={"center"}
                w={["100%", "400px", "450px"]}
                py={[6, 8, 9]}
                boxShadow="dark-lg"
            >
                <Heading as="h2" fontWeight={500} fontSize="5xl">
                    Create Room
                </Heading>
                <VStack
                    my={2}
                    spacing={2}
                    justifyContent="flex-start"
                    alignItems={"start"}
                    as="form"
                    onSubmit={handleCreateRoom}
                >
                    <Divider borderWidth={"1.5px"} borderColor="gray.300" />
                    <Text as="label" color={"gray.700"}>
                        Allow guests to play/pause music?
                    </Text>
                    <HStack justifyContent={"center"} w={"100%"}>
                        <Text
                            as="label"
                            color={"gray.700"}
                            fontWeight={"semibold"}
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
                        >
                            Yes
                        </Text>
                    </HStack>

                    <Divider borderWidth={"1.5px"} borderColor="gray.300" />
                    <VStack w={"100%"}>
                        <HStack>
                            <Text as="label" htmlFor="votes">
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
                </VStack>
                <Stack
                    direction={["column", "row"]}
                    my={1}
                    spacing={3}
                    flexDirection={["column-reverse","row-reverse"]}
                    justifyContent={"center"}
                    alignItems={"center"}
                >
                    <Link to="/join">
                        <Button
                            fontWeight={"semibold"}
                            fontSize="lg"
                            color="blue.500"
                            boxShadow={"lg"}
                        >
                            Join Room
                        </Button>
                    </Link>
                    <Text as="label" color={"gray.700"} fontWeight={"semibold"}>
                        Or
                    </Text>
                    <Button colorScheme="blue" onClick={handleCreateRoom}>
                        Create Room
                    </Button>
                </Stack>
            </VStack>
        </VStack>
    );
}
export default CreateRoom;
