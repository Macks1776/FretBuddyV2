import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../providers/TooltipProvider';
import HapticService from '../../services/HapticService';

export interface LabelWithTooltipProps {
  label: string;
  tooltip?: string;
  tooltipTitle?: string;
}

export default function LabelWithTooltip({ label, tooltip, tooltipTitle }: LabelWithTooltipProps) {
  const { colors } = useTheme();
  const { showTooltip } = useTooltip();

  return (
    <View style={styles.labelContainer}>
      <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>
        {label}
      </Text>
      {tooltip && (
        <Pressable
          onPress={() => {
            HapticService.light();
            showTooltip(tooltipTitle || label, tooltip);
          }}
          hitSlop={10}
          style={{ marginLeft: 6 }}
        >
          <Info color={colors.textSecondary} size={16} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
