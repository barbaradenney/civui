/**
 * Platform-specific naming maps for enum values.
 *
 * Web uses short names (2xs, tel) while native platforms prefer
 * descriptive names (xxSmall, telephone). These maps bridge
 * the schema's canonical values to platform-idiomatic names.
 */

/** Maps schema width keys to native enum case names */
export const WIDTH_NATIVE_NAMES: Record<string, string> = {
  'default': 'full',
  '2xs': 'xxSmall',
  'xs': 'xSmall',
  'sm': 'small',
  'md': 'medium',
  'lg': 'large',
  'xl': 'xLarge',
  '2xl': 'xxLarge',
};

/** Maps schema input type keys to native enum case names */
export const INPUT_TYPE_NATIVE_NAMES: Record<string, string> = {
  'text': 'text',
  'email': 'email',
  'number': 'number',
  'password': 'password',
  'search': 'search',
  'tel': 'telephone',
  'url': 'url',
};

/** Maps schema input type keys to Kotlin PascalCase enum names */
export const INPUT_TYPE_KOTLIN_NAMES: Record<string, string> = {
  'text': 'Text',
  'email': 'Email',
  'number': 'Number',
  'password': 'Password',
  'search': 'Search',
  'tel': 'Telephone',
  'url': 'Url',
};

/** Maps schema width keys to Kotlin PascalCase enum names */
export const WIDTH_KOTLIN_NAMES: Record<string, string> = {
  'default': 'Full',
  '2xs': 'XxSmall',
  'xs': 'XSmall',
  'sm': 'Small',
  'md': 'Medium',
  'lg': 'Large',
  'xl': 'XLarge',
  '2xl': 'XxLarge',
};
