import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface StatusConfig {
  icon: IconName;
  label: string;
  color: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: {
    icon: 'clock-outline',
    label: 'Pending',
    color: COLORS.PRIMARY_YELLOW,
  },
  preparing: {
    icon: 'food',
    label: 'Preparing',
    color: COLORS.PRIMARY_YELLOW,
  },
  ready: {
    icon: 'check-circle',
    label: 'Ready',
    color: COLORS.PRIMARY_RED,
  },
  on_the_way: {
    icon: 'bike',
    label: 'On the Way',
    color: COLORS.PRIMARY_RED,
  },
  delivered: {
    icon: 'check-all',
    label: 'Delivered',
    color: COLORS.SUCCESS,
  },
  cancelled: {
    icon: 'close-octagon-outline',
    label: 'Cancelled',
    color: COLORS.PRIMARY_RED,
  },
  active_rider: {
    icon: 'account-check-outline',
    label: 'Active Rider',
    color: COLORS.PRIMARY_RED,
  },
};

interface StatusChipProps {
  status: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  compact?: boolean;
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  style,
  textStyle,
  compact = true,
}) => {
  const config = STATUS_CONFIG[status] ?? {
    icon: 'help-circle' as IconName,
    label: label || status || 'Status',
    color: COLORS.TEXT_SECONDARY,
  };

  const displayLabel = label || config.label;

  return (
    <Chip
      compact={compact}
      icon={() => (
        <MaterialCommunityIcons
          name={config.icon}
          size={18}
          color={COLORS.WHITE}
        />
      )}
      style={[styles.chip, { backgroundColor: config.color }, style]}
      textStyle={[styles.label, textStyle]}
    >
      {displayLabel}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    height: 32,
    alignSelf: 'flex-start',
  },
  label: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatusChip;

