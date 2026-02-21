import { useState } from 'react';
import { View } from 'react-native';
import { TextInput } from './TextInput';
const meta = {
    title: 'Forms/TextInput',
    component: TextInput,
    decorators: [
        (Story) => (<View style={{ padding: 16 }}>
        <Story />
      </View>),
    ],
};
export default meta;
export const Default = {
    args: {
        name: 'name',
        label: 'Full name',
        placeholder: 'Enter your name',
    },
};
export const WithHint = {
    args: {
        name: 'email',
        label: 'Email address',
        hint: 'We will only use this to contact you',
        type: 'email',
        placeholder: 'you@example.com',
    },
};
export const WithError = {
    args: {
        name: 'email',
        label: 'Email address',
        error: 'Please enter a valid email',
        type: 'email',
        required: true,
    },
};
export const Required = {
    args: {
        name: 'phone',
        label: 'Phone number',
        type: 'tel',
        required: true,
    },
};
export const Disabled = {
    args: {
        name: 'locked',
        label: 'Locked field',
        value: 'Cannot edit this',
        disabled: true,
    },
};
export const Password = {
    args: {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
    },
};
function ControlledExample() {
    const [value, setValue] = useState('');
    return (<TextInput name="controlled" label="Controlled input" hint={`Current value: "${value}"`} value={value} onChange={setValue}/>);
}
export const Controlled = {
    render: () => <ControlledExample />,
};
//# sourceMappingURL=TextInput.stories.js.map