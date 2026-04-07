/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
      extend: {
          "colors": {
              "tertiary-container": "#fb5945",
              "on-surface": "#f6d9fd",
              "surface-dim": "#1d0c26",
              "inverse-surface": "#f6d9fd",
              "primary": "#ffb59e",
              "surface": "#1d0c26",
              "secondary": "#fff9ef",
              "on-background": "#f6d9fd",
              "surface-tint": "#ffb59e",
              "on-error": "#690005",
              "on-primary-fixed": "#3a0b00",
              "tertiary-fixed-dim": "#ffb4a8",
              "surface-bright": "#46324e",
              "on-tertiary-container": "#5c0000",
              "on-secondary-fixed": "#221b00",
              "inverse-on-surface": "#3c2944",
              "tertiary": "#ffb4a8",
              "primary-container": "#ff571a",
              "error-container": "#93000a",
              "on-secondary-fixed-variant": "#544600",
              "inverse-primary": "#ae3200",
              "on-tertiary-fixed": "#410000",
              "on-primary-fixed-variant": "#852400",
              "on-surface-variant": "#e6beb2",
              "surface-container-high": "#36233e",
              "error": "#ffb4ab",
              "on-primary": "#5e1700",
              "secondary-container": "#ffdb3c",
              "tertiary-fixed": "#ffdad4",
              "outline-variant": "#5c4037",
              "on-tertiary": "#690000",
              "on-secondary-container": "#725f00",
              "background": "#1d0c26",
              "surface-container-lowest": "#180720",
              "secondary-fixed": "#ffe16d",
              "secondary-fixed-dim": "#e9c400",
              "surface-variant": "#412d49",
              "primary-fixed-dim": "#ffb59e",
              "on-error-container": "#ffdad6",
              "surface-container-highest": "#412d49",
              "outline": "#ad897e",
              "surface-container-low": "#26142e",
              "on-tertiary-fixed-variant": "#920703",
              "surface-container": "#2a1833",
              "primary-fixed": "#ffdbd0",
              "on-secondary": "#3a3000",
              "on-primary-container": "#521300"
          },
          "borderRadius": {
              "DEFAULT": "0.125rem",
              "lg": "0.25rem",
              "xl": "0.5rem",
              "full": "0.75rem"
          },
          "fontFamily": {
              "headline": [
                  "Space Grotesk"
              ],
              "body": [
                  "Inter"
              ],
              "label": [
                  "Inter"
              ]
          }
      },
  },
  plugins: [],
}
