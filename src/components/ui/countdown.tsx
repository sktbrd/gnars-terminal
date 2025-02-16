'use client';

import { Text } from '@chakra-ui/react';
import { default as ReactCountDown, zeroPad } from 'react-countdown';

interface CountdownRendererProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownRenderer = ({
  days,
  hours,
  minutes,
  seconds,
}: CountdownRendererProps) => (
  <Text display={'inline-block'}>
    {days > 0 && `${zeroPad(days)}d `}
    {hours > 0 && `${zeroPad(hours)}h `}
    {minutes >= 0 && `${zeroPad(minutes)}m `}
    {zeroPad(seconds)}s
  </Text>
);

export function Countdown({ date }: { date: number }) {
  return <ReactCountDown renderer={CountdownRenderer} date={date} />;
}
