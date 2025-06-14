import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface CodeDisplayProps {
  code: string;
  language?: string;
}

export default function CodeDisplay({ code, language = 'javascript' }: CodeDisplayProps) {
  // Basic syntax highlighting (can be expanded with a proper library like react-syntax-highlighter)
  const highlightCode = (text: string) => {
    return text.split(/(\b(?:function|const|let|var|return|if|else|for|while|import|export|default|from|as|class|extends|super|new|this|try|catch|finally|throw|await|async|true|false|null|undefined)\b|\b\d+\b|\"[^\"]*\"|'[^']*')/).map((part, index) => {
      if (part.match(/\b(?:function|const|let|var|return|if|else|for|while|import|export|default|from|as|class|extends|super|new|this|try|catch|finally|throw|await|async|true|false|null|undefined)\b/)) {
        return <Text key={index} style={styles.keyword}>{part}</Text>;
      } else if (part.match(/\b\d+\b/)) {
        return <Text key={index} style={styles.number}>{part}</Text>;
      } else if (part.match(/\"[^\"]*\"|'[^']*'/)) {
        return <Text key={index} style={styles.string}>{part}</Text>;
      } else {
        return <Text key={index} style={styles.plain}>{part}</Text>;
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.codeText}>
          {highlightCode(code)}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282c34',
    padding: 10,
    borderRadius: 5,
  },
  scrollView: {
    flex: 1,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  plain: {
    color: '#abb2bf',
  },
  keyword: {
    color: '#c678dd',
  },
  number: {
    color: '#d19a66',
  },
  string: {
    color: '#98c379',
  },
});