import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Text } from 'react-native-paper';
import { useAccessibility } from './AccessibilityProvider';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  subtitle?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 180,
  strokeWidth = 18,
  color,
  backgroundColor,
  subtitle = 'Doses Taken',
}) => {
  const { getScaledFontSize, highContrast } = useAccessibility();

  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  const defaultColor = highContrast ? '#00FF00' : (color || '#0D5C75');
  const defaultBg = highContrast ? '#222222' : (backgroundColor || '#E2E8F0');

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={defaultBg}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={defaultColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>
      <View style={styles.textOverlay}>
        <Text
          variant="headlineLarge"
          style={[
            styles.percentageText,
            {
              fontSize: getScaledFontSize(32),
              color: highContrast ? '#FFFF00' : '#0F172A',
              fontWeight: 'bold',
            },
          ]}
        >
          {clampedPercentage}%
        </Text>
        {subtitle && (
          <Text
            variant="labelMedium"
            style={[
              styles.subtitleText,
              {
                fontSize: getScaledFontSize(14),
                color: highContrast ? '#FFFFFF' : '#64748B',
                marginTop: 4,
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    textAlign: 'center',
  },
  subtitleText: {
    textAlign: 'center',
    fontWeight: '500',
  },
});
export default CircularProgress;
