const config = {
    prefix: 'civ-',
    content: ['./packages/*/src/**/*.ts'],
    theme: {
        extend: {
            colors: {
                primary: {
                    lightest: 'var(--civ-color-primary-lightest)',
                    lighter: 'var(--civ-color-primary-lighter)',
                    light: 'var(--civ-color-primary-light)',
                    DEFAULT: 'var(--civ-color-primary-DEFAULT)',
                    vivid: 'var(--civ-color-primary-vivid)',
                    dark: 'var(--civ-color-primary-dark)',
                    darker: 'var(--civ-color-primary-darker)',
                },
                error: {
                    lighter: 'var(--civ-color-error-lighter)',
                    light: 'var(--civ-color-error-light)',
                    DEFAULT: 'var(--civ-color-error-DEFAULT)',
                    dark: 'var(--civ-color-error-dark)',
                },
                warning: {
                    lighter: 'var(--civ-color-warning-lighter)',
                    light: 'var(--civ-color-warning-light)',
                    DEFAULT: 'var(--civ-color-warning-DEFAULT)',
                    dark: 'var(--civ-color-warning-dark)',
                },
                success: {
                    lighter: 'var(--civ-color-success-lighter)',
                    light: 'var(--civ-color-success-light)',
                    DEFAULT: 'var(--civ-color-success-DEFAULT)',
                    dark: 'var(--civ-color-success-dark)',
                },
                info: {
                    lighter: 'var(--civ-color-info-lighter)',
                    light: 'var(--civ-color-info-light)',
                    DEFAULT: 'var(--civ-color-info-DEFAULT)',
                    dark: 'var(--civ-color-info-dark)',
                },
                base: {
                    lightest: 'var(--civ-color-base-lightest)',
                    lighter: 'var(--civ-color-base-lighter)',
                    light: 'var(--civ-color-base-light)',
                    DEFAULT: 'var(--civ-color-base-DEFAULT)',
                    dark: 'var(--civ-color-base-dark)',
                    darker: 'var(--civ-color-base-darker)',
                    darkest: 'var(--civ-color-base-darkest)',
                },
            },
            fontFamily: {
                sans: [
                    'Public Sans',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif',
                ],
                mono: [
                    'Roboto Mono',
                    'Consolas',
                    'Monaco',
                    'Andale Mono',
                    'Ubuntu Mono',
                    'monospace',
                ],
            },
        },
    },
    plugins: [],
};
export default config;
//# sourceMappingURL=tailwind.config.js.map