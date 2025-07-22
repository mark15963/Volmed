import { useState } from "react";
import Button from "./Buttons";
import { fn } from "storybook/internal/test";
import { action } from 'storybook/actions';

export default {
  title: 'Components/Button',
  component: Button,
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

export const Primary = {
  name: 'Standart button',
  args: {
    text: 'Click Me!',
    size: 'l',
    icon: 'none',
    disabled: false,
    loading: false,
    // onClick: (() => { console.log("clicked") }),
  }
}