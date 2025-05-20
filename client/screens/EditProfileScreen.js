import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Avatar, Chip, useTheme, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Config from 'react-native-config';
import { useNavigation } from '@react-navigation/native';

const PROGRAMMING_LANGUAGES = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Swift', 'Kotlin', 'PHP', 'TypeScript', 'Rust'
];

const EditProfileScreen = () => {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${Config.API_BASE_URL || 'http://localhost:5000/api'}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        }
      );
      
      const { username, bio, languages } = response.data;
      setUsername(username || '');
      setBio(bio || '');
      setSelectedLanguages(languages || []);
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    try {
      setSaving(true);
      await axios.put(
        `${Config.API_BASE_URL || 'http://localhost:5000/api'}/users/me`,
        {
          username,
          bio,
          languages: selectedLanguages,
        },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        }
      );

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (language) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(lang => lang !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarContainer}>
        <Avatar.Image
          size={100}
          source={require('../assets/default-avatar.png')}
        />
        <Button mode="text" style={styles.changeAvatarButton}>
          Change Avatar
        </Button>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Bio"
          value={bio}
          onChangeText={setBio}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={3}
        />

        <View style={styles.languagesSection}>
          <Text style={styles.sectionTitle}>Programming Languages</Text>
          <View style={styles.languageChips}>
            {PROGRAMMING_LANGUAGES.map((language) => (
              <Chip
                key={language}
                selected={selectedLanguages.includes(language)}
                onPress={() => toggleLanguage(language)}
                style={styles.chip}
                selectedColor={theme.colors.primary}
              >
                {language}
              </Chip>
            ))}
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={saving}
          disabled={saving}
        >
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  changeAvatarButton: {
    marginTop: 8,
  },
  formContainer: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  languagesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  languageChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});

export default EditProfileScreen;