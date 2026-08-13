import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { CIRCLE_DATA } from "../../utils/circleOfFifthsData";
import { useTheme } from "../../hooks/useTheme";

interface Props {
  activeKey: string;
  onSelectKey: (key: string) => void;
}

export default function CircleOfFifthsVisual({ activeKey, onSelectKey }: Props) {
  const { colors, isDark } = useTheme();

  // Use responsive sizing
  const screenWidth = Dimensions.get("window").width;
  const containerSize = Math.min(screenWidth - 40, 340);
  const center = containerSize / 2;
  
  const outerRadius = containerSize * 0.40;
  const innerRadius = containerSize * 0.22;
  
  // Outer circle node sizes
  const outerNodeSize = 44;
  const innerNodeSize = 34;

  // Active Position for the Wedge
  let activePosition = 0;
  const activeItem = CIRCLE_DATA.find(c => c.majorKey === activeKey || c.minorKey === activeKey);
  if (activeItem) {
    activePosition = activeItem.position;
  }

  // Calculate SVG Wedge to highlight the diatonic chords (P-1, P, P+1)
  const wedgeRadius = outerRadius + outerNodeSize / 2 + 10; 
  const startAngle = (activePosition - 1.5) * 30 * Math.PI / 180 - Math.PI / 2;
  const endAngle = (activePosition + 1.5) * 30 * Math.PI / 180 - Math.PI / 2;
  
  const startX = center + wedgeRadius * Math.cos(startAngle);
  const startY = center + wedgeRadius * Math.sin(startAngle);
  const endX = center + wedgeRadius * Math.cos(endAngle);
  const endY = center + wedgeRadius * Math.sin(endAngle);
  
  const wedgePath = `M ${center} ${center} L ${startX} ${startY} A ${wedgeRadius} ${wedgeRadius} 0 0 1 ${endX} ${endY} Z`;

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      {/* Active Segment Highlight */}
      <Svg height={containerSize} width={containerSize} style={StyleSheet.absoluteFill}>
        <Path 
          d={wedgePath} 
          fill={colors.tint} 
          opacity={isDark ? 0.25 : 0.15} 
        />
      </Svg>

      {/* Decorative concentric circles */}
      <View style={[styles.decorativeRing, { 
        width: outerRadius * 2, height: outerRadius * 2, borderRadius: outerRadius,
        borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"
      }]} />
      <View style={[styles.decorativeRing, { 
        width: innerRadius * 2, height: innerRadius * 2, borderRadius: innerRadius, 
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" 
      }]} />

      {CIRCLE_DATA.map((item: any) => {
        // Calculate angle (0 is at 12 o'clock, progressing clockwise)
        const angle = (item.position * 30 * Math.PI) / 180 - Math.PI / 2;
        
        // Outer coordinates (Major)
        const outerX = center + outerRadius * Math.cos(angle) - outerNodeSize / 2;
        const outerY = center + outerRadius * Math.sin(angle) - outerNodeSize / 2;
        
        // Inner coordinates (Minor)
        const innerX = center + innerRadius * Math.cos(angle) - innerNodeSize / 2;
        const innerY = center + innerRadius * Math.sin(angle) - innerNodeSize / 2;

        const isMajorActive = activeKey === item.majorKey;
        const isMinorActive = activeKey === item.minorKey;

        return (
          <React.Fragment key={`slice-${item.position}`}>
            
            {/* Inner Ring (Minor Keys) */}
            <Pressable
              style={[
                styles.node, 
                styles.innerNode,
                { left: innerX, top: innerY, width: innerNodeSize, height: innerNodeSize, backgroundColor: colors.surface, borderColor: colors.border },
                isMinorActive && [styles.activeNode, { backgroundColor: colors.tint, borderColor: colors.tint }]
              ]}
              onPress={() => onSelectKey(item.minorKey)}
            >
              <Text style={[styles.nodeText, styles.innerNodeText, { color: colors.textSecondary }, isMinorActive && styles.activeNodeText]}>
                {item.minorKey}
              </Text>
            </Pressable>

            {/* Outer Ring (Major Keys) */}
            <Pressable
              style={[
                styles.node, 
                styles.outerNode,
                { left: outerX, top: outerY, width: outerNodeSize, height: outerNodeSize, backgroundColor: colors.card, borderColor: colors.border },
                isMajorActive && [styles.activeNode, { backgroundColor: colors.tint, borderColor: colors.tint }]
              ]}
              onPress={() => onSelectKey(item.majorKey)}
            >
              <Text style={[styles.nodeText, { color: colors.text }, isMajorActive && styles.activeNodeText]}>
                {item.majorKey}
              </Text>
              
              {/* Signature Indicator (small text below) */}
              <View style={[styles.signatureBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.signatureText, { color: colors.textSecondary }]}>{item.signature}</Text>
              </View>
            </Pressable>
            
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "center",
    marginVertical: 20,
  },
  decorativeRing: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.08)",
  },
  node: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outerNode: {
    borderWidth: 1,
    borderColor: "#e0e4eb",
  },
  innerNode: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e4eb",
  },
  activeNode: {
    transform: [{ scale: 1.15 }],
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  nodeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  innerNodeText: {
    fontSize: 12,
  },
  activeNodeText: {
    color: "#fff",
  },
  signatureBadge: {
    position: "absolute",
    bottom: -16,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  signatureText: {
    fontSize: 9,
    fontWeight: "bold",
  }
});
