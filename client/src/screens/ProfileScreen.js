import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const menuItems = [
    {
      icon: 'account-outline',
      title: 'Personal Information',
      onPress: () => {},
    },
    {
      icon: 'bell-outline',
      title: 'Notifications',
      onPress: () => {},
    },
    {
      icon: 'shield-outline',
      title: 'Privacy & Security',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => {},
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <Icon name="camera" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          John Doe
        </Text>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
          john.doe@example.com
        </Text>
      </View>

      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              128
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Tasks
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              95%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Completed
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              12
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Streak
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index !== menuItems.length - 1 && styles.menuItemBorder,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Icon
                name={item.icon}
                size={24}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                {item.title}
              </Text>
            </View>
            <Icon
              name="chevron-right"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </Card>

      <Button
        title="Sign Out"
        variant="secondary"
        onPress={() => navigation.replace('Login')}
        style={styles.signOutButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  menuCard: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  signOutButton: {
    marginTop: 8,
  },
});

export default ProfileScreen; 