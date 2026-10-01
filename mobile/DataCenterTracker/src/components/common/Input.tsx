import { forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/theme/spacing';
import { FontSizes, FontWeights } from '@/theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, icon, rightIcon, onRightIconPress, ...props }, ref) => {
    const theme = useTheme();
    const hasError = !!error;

    return (
      <View style={styles.container}>
        {label && (
          <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        )}

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: hasError ? theme.danger : 'transparent',
            },
          ]}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={theme.textSecondary}
              style={styles.leftIcon}
            />
          )}

          <TextInput
            ref={ref}
            style={[styles.input, { color: theme.text }]}
            placeholderTextColor={theme.textSecondary}
            {...props}
          />

          {rightIcon && (
            <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
              <Ionicons name={rightIcon} size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>

        {error && (
          <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    paddingHorizontal: Spacing.base,
    minHeight: 52,
  },
  leftIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    paddingVertical: Spacing.md,
  },
  rightIcon: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  error: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
});
