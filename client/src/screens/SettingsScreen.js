import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Card from '../components/common/Card';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingsScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = React.useState(true);
  const [biometric, setBiometric] = React.useState(false);
  const [location, setLocation] = React.useState(true);

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'theme-light-dark',
          title: 'Dark Mode',
          type: 'switch',
          value: isDarkMode,
          onValueChange: toggleTheme,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'bell-outline',
          title: 'Push Notifications',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          icon: 'email-outline',
          title: 'Email Notifications',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: 'fingerprint',
          title: 'Biometric Authentication',
          type: 'switch',
          value: biometric,
          onValueChange: setBiometric,
        },
        {
          icon: 'lock-outline',
          title: 'Change Password',
          type: 'link',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          icon: 'map-marker-outline',
          title: 'Location Services',
          type: 'switch',
          value: location,
          onValueChange: setLocation,
        },
        {
          icon: 'shield-outline',
          title: 'Privacy Policy',
          type: 'link',
          onPress: () => {},
        },
      ],
    },
  ];

  const renderSettingItem = (item) => {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingItemLeft}>
          <Icon
            name={item.icon}
            size={24}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.settingItemText, { color: theme.colors.text }]}>
            {item.title}
          </Text>
        </View>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
          />
        ) : (
          <Icon
            name="chevron-right"
            size={24}
            color={theme.colors.textSecondary}
          />
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {settingsSections.map((section, index) => (
        <Card key={index} style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {section.title}
          </Text>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex}>
              {itemIndex > 0 && (
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              )}
              {item.type === 'link' ? (
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={item.onPress}
                >
                  {renderSettingItem(item)}
                </TouchableOpacity>
              ) : (
                renderSettingItem(item)
              )}
            </View>
          ))}
        </Card>
      ))}

      <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
        Version 1.0.0
      </Text>
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
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  version: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});

export default SettingsScreen; 