import React from 'react';
import { StyleSheet, View } from 'react-native';
import CodeDisplay from '../../components/CodeDisplay';
import VideoPlayer from '../../components/VideoPlayer';

export default function VideoCodeScreen() {
  const sampleVideo = 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4'; // Replace with your video source
  const sampleCode = `
function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("World");

const sum = (a, b) => a + b;
console.log(sum(5, 3));
`;

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <VideoPlayer videoSource={sampleVideo} />
      </View>
      <View style={styles.codeContainer}>
        <CodeDisplay code={sampleCode} language="javascript" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  codeContainer: {
    flex: 1,
    backgroundColor: '#282c34',
  },
});