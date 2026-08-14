import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/useSettingsStore';

class HapticService {
  private static shouldHaptic(): boolean {
    return useSettingsStore.getState().hapticPreference !== 'off';
  }

  private static getStyle(defaultStyle: Haptics.ImpactFeedbackStyle): Haptics.ImpactFeedbackStyle {
    const pref = useSettingsStore.getState().hapticPreference;
    if (pref === 'light') return Haptics.ImpactFeedbackStyle.Light;
    if (pref === 'medium') return Haptics.ImpactFeedbackStyle.Medium;
    if (pref === 'heavy') return Haptics.ImpactFeedbackStyle.Heavy;
    return defaultStyle;
  }

  static async light() {
    if (!this.shouldHaptic()) return;
    await Haptics.impactAsync(this.getStyle(Haptics.ImpactFeedbackStyle.Light));
  }

  static async medium() {
    if (!this.shouldHaptic()) return;
    await Haptics.impactAsync(this.getStyle(Haptics.ImpactFeedbackStyle.Medium));
  }

  static async heavy() {
    if (!this.shouldHaptic()) return;
    await Haptics.impactAsync(this.getStyle(Haptics.ImpactFeedbackStyle.Heavy));
  }

  static async success() {
    if (!this.shouldHaptic()) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

export default HapticService;
