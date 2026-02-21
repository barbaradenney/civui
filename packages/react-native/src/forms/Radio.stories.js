import { useState } from 'react';
import { View } from 'react-native';
import { RadioGroup } from './Radio';
const SIZES = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
];
const PLANS = [
    { value: 'free', label: 'Free', description: 'Basic features, limited usage' },
    { value: 'pro', label: 'Pro', description: 'All features, unlimited usage' },
    { value: 'enterprise', label: 'Enterprise', description: 'Custom solutions and support' },
];
const meta = {
    title: 'Forms/RadioGroup',
    component: RadioGroup,
    decorators: [
        (Story) => (<View style={{ padding: 16 }}>
        <Story />
      </View>),
    ],
};
export default meta;
export const Default = {
    args: {
        name: 'size',
        label: 'Size',
        options: SIZES,
    },
};
export const WithHint = {
    args: {
        name: 'size',
        label: 'Size',
        hint: 'Choose your preferred size',
        options: SIZES,
    },
};
export const WithDescriptions = {
    args: {
        name: 'plan',
        label: 'Subscription plan',
        options: PLANS,
    },
};
export const Tile = {
    args: {
        name: 'plan',
        label: 'Choose a plan',
        options: PLANS,
        tile: true,
    },
};
export const WithError = {
    args: {
        name: 'size',
        label: 'Size',
        error: 'Please select a size',
        required: true,
        options: SIZES,
    },
};
export const Disabled = {
    args: {
        name: 'size',
        label: 'Size',
        value: 'md',
        disabled: true,
        options: SIZES,
    },
};
function ControlledExample() {
    const [value, setValue] = useState('');
    return (<RadioGroup name="plan" label="Choose a plan" hint={`Selected: ${value || 'none'}`} options={PLANS} tile value={value} onChange={setValue}/>);
}
export const Controlled = {
    render: () => <ControlledExample />,
};
//# sourceMappingURL=Radio.stories.js.map