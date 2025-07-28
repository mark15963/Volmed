import { useState } from "react";
import Graph from "../Graph";
import { fn } from "storybook/internal/test";
import { action } from 'storybook/actions';
import { color } from "storybook/internal/theming";

export default {
    title: 'Components/Graph',
    component: Graph,
    parameters: {
        layout: 'centered',
        styles: {
            fontFamily: "'Roboto', Montseratt",
        }
    },
    argTypes: {
        variant: {
            options: ['primary'],
            type: 'color'
        },
        lineColor: {
            control: {
                type: 'color',
                presetColors: ['#ff0000', '#00ff00', '#0000ff'],
            },
        },
    },
}

export const Primary = {
    name: 'Standart graph',
    args: {
        variant: 'primary',
        title: 'Graph title',
        data: [
            {
                val: 100,
                created_at: '',
            },
            {
                val: 50,
                created_at: ''
            }
        ],
        lineColor: '#ff0f0f',
        backgroundColor: "aliceblue",
        minVal: 0,
        maxVal: 100,
        height: 100,
        areaOpacity: 0.2,
        padding: 30,
    }
}