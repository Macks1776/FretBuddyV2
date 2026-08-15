import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, Pressable, View, Text, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

interface TooltipContextType {
  showTooltip: (title: string, message: string) => void;
  hideTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [activeTooltip, setActiveTooltip] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const { colors } = useTheme();

  const showTooltip = (title: string, message: string) => {
    setActiveTooltip({ title, message });
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      {activeTooltip && (
        <Modal visible={true} transparent animationType="fade">
          <Pressable
            style={styles.tooltipOverlay}
            onPress={hideTooltip}
          >
            <Pressable
              style={[
                styles.tooltipContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.tooltipHeader}>
                <Text style={[styles.tooltipTitle, { color: colors.text }]}>
                  {activeTooltip.title}
                </Text>
                <Pressable onPress={hideTooltip}>
                  <X color={colors.textSecondary} size={20} />
                </Pressable>
              </View>
              <Text style={[styles.tooltipMessage, { color: colors.textSecondary }]}>
                {activeTooltip.message}
              </Text>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  tooltipContainer: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  tooltipMessage: {
    fontSize: 16,
    lineHeight: 24,
  },
});
