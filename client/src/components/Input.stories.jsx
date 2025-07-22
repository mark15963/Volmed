import { fn } from "storybook/internal/test";
import Input from "./Input";

export default {
    title: 'Components/Input',
    component: Input,
    parameters: {
        layout: 'centered',
        action: {
            argTypesRegex: '^on.*',
        }
    },
    args: {
        onClick: fn(),
    },
    argTypes: { onClick: { action: 'on-click' } },
}

export const Default = {
    name: 'Standart input',
    args: {
        placeholder: 'Enter text...',
        autoComplete: 'off',
        name: "field",
    }
}