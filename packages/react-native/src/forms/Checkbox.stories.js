import { useState } from 'react';
import { View } from 'react-native';
import { Checkbox } from './Checkbox';
const meta = {
    title: 'Forms/Checkbox',
    component: Checkbox,
    decorators: [
        (Story) => (<View style={{ padding: 16 }}>
        <Story />
      </View>),
    ],
};
export default meta;
export const Default = {
    args: {
        name: 'terms',
        label: 'I agree to the terms and conditions',
    },
};
export const Checked = {
    args: {
        name: 'terms',
        label: 'I agree to the terms and conditions',
        checked: true,
    },
};
export const WithDescription = {
    args: {
        name: 'newsletter',
        label: 'Subscribe to newsletter',
        description: 'Get weekly updates about new features and improvements',
    },
};
export const Tile = {
    args: {
        name: 'premium',
        label: 'Premium plan',
        description: 'Includes all features and priority support',
        tile: true,
    },
};
export const WithError = {
    args: {
        name: 'terms',
        label: 'I agree to the terms',
        error: 'You must agree to continue',
        required: true,
    },
};
export const Disabled = {
    args: {
        name: 'locked',
        label: 'Locked option',
        checked: true,
        disabled: true,
    },
};
function ControlledExample() {
    const [checked, setChecked] = useState(false);
    return (<Checkbox name="controlled" label={`Checkbox is ${checked ? 'checked' : 'unchecked'}`} checked={checked} onChange={setChecked}/>);
}
export const Controlled = {
    render: () => <ControlledExample />,
};
//# sourceMappingURL=Checkbox.stories.js.map