import img from "../assets/back.jpeg";
import { Box } from "@chakra-ui/react";
import React from "react";
function BackBlur({ image }) {
    if (!image) {
        image = img;
    }
    return (
        <Box
            bgImage={image}
            bgSize="cover"
            bgPosition="center"
            w="100%"
            h="100%"
            position="absolute"
            top="0"
            left="0"
            zIndex="-1"
            filter="blur(8px)"
        />
    );
}
export default BackBlur;
