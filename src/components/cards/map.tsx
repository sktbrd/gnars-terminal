import { Box } from "@chakra-ui/react";

function MapCard() {
  return (
    <Box
      shadow={'sm'}
      w={'full'}
      rounded={'md'}
      _dark={{ borderColor: 'yellow', borderWidth: 1 }}
      display={'flex'}
      flexDirection={'column'}
      gap={2}
      overflow={'hidden'}
    >
      <iframe src="https://gnars.center/map" width="100%" height="500px" style={{ border: 'none' }}></iframe>
    </Box>
  )
}

export default MapCard;