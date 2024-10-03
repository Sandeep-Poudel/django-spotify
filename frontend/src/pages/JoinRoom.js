import React from "react";
import {
    Heading,
    Input,
    VStack,
    Stack,
    Button,
    Text,
    Divider,
} from "@chakra-ui/react";
import BackBlur from "../components/BackBlur";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function JoinRoom() {
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [code, setCode] = useState("");

    const handleChange = (e) => {
        setCode(e.target.value);
    };

    const handleRoomJoin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/join-room/", {
                code: code.toUpperCase(),
            });
            if (response.status !== 200) {
                setCode("");
            } else {
                // Navigate to room page upon successful join
                navigate(`/room/${code.toUpperCase()}`);
            }
        } catch (error) {
            // Catch API or network errors and display them
            setError(error.response.data["Bad Request"]);
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
                    Join Room
                </Heading>
                <VStack
                    my={2}
                    justifyContent="flex-start"
                    alignItems={"start"}
                    as="form"
                    onSubmit={handleRoomJoin}
                >
                    <Divider borderWidth={"1.5px"} borderColor="gray.300" />
                    <Text as="label" fontWeight={600}>
                        Enter room code:
                    </Text>
                    <Input
                        as="input"
                        placeholder="Room ID"
                        onChange={handleChange}
                        value={code}
                    />
                    {!!error && <Text color="red.500">{error}</Text>}
                    <Divider borderWidth={"1.5px"} borderColor="gray.300" />
                </VStack>
                <Stack
                    direction={["column", "row"]}
                    my={1}
                    spacing={3}
                    flexDirection={["column-reverse","row-reverse"]}
                    justifyContent={"center"}
                    alignItems={"center"}
                >
                    <Link to="/create">
                        <Button
                            fontWeight={"semibold"}
                            fontSize="lg"
                            color="blue.500"
                            boxShadow={"lg"}
                        >
                            Create Room
                        </Button>
                    </Link>

                    <Text as="label" color={"gray.700"} fontWeight={"semibold"}>
                        Or
                    </Text>
                    <Button colorScheme="blue" onClick={handleRoomJoin}>
                        Join Room
                    </Button>
                </Stack>
            </VStack>
        </VStack>
    );
}
export default JoinRoom;
