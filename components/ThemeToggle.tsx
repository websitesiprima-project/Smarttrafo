"use client";

import React from "react";
import styled from "styled-components";

// ============================================================================
// INTERFACE (KAMUS TYPE SCRIPT)
// ============================================================================
interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeToggle = ({ isDarkMode, toggleTheme }: ThemeToggleProps) => {
  return (
    <StyledWrapper>
      <label id="theme-toggle-button">
        <input
          type="checkbox"
          id="toggle"
          checked={isDarkMode}
          onChange={toggleTheme}
        />
        <svg viewBox="0 0 69.667 44" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(3.5 3.5)" id="Component_15_1">
            <g
              filter="url(#container)"
              transform="matrix(1, 0, 0, 1, -3.5, -3.5)"
            >
              <rect
                fill="#83cbd8"
                transform="translate(3.5 3.5)"
                rx="17.5"
                height={35}
                width="60.667"
                id="container"
              />
            </g>
            <g transform="translate(2.333 2.333)" id="button">
              <g id="sun">
                <g
                  filter="url(#sun-outer)"
                  transform="matrix(1, 0, 0, 1, -5.83, -5.83)"
                >
                  <circle
                    fill="#f8e664"
                    transform="translate(5.83 5.83)"
                    r="15.167"
                    cy="15.167"
                    cx="15.167"
                    id="sun-outer-2"
                  />
                </g>
                <circle
                  fill="#fcf4b9"
                  transform="translate(8.167 8.167)"
                  r={7}
                  cy={7}
                  cx={7}
                  id="sun-inner"
                />
              </g>
              <g id="moon">
                <g
                  filter="url(#moon)"
                  transform="matrix(1, 0, 0, 1, -31.5, -5.83)"
                >
                  <circle
                    fill="#cce6ee"
                    transform="translate(31.5 5.83)"
                    r="15.167"
                    cy="15.167"
                    cx="15.167"
                    id="moon-3"
                  />
                </g>
                <g
                  fill="#a6cad0"
                  transform="translate(-24.415 -1.009)"
                  id="patches"
                >
                  <circle
                    transform="translate(43.009 4.496)"
                    r={2}
                    cy={2}
                    cx={2}
                  />
                  <circle
                    transform="translate(39.366 17.952)"
                    r={2}
                    cy={2}
                    cx={2}
                  />
                </g>
              </g>
            </g>
            <g filter="url(#cloud)" transform="matrix(1, 0, 0, 1, -3.5, -3.5)">
              <path
                fill="#fff"
                transform="translate(-3466.47 -160.94)"
                d="M3512.81,173.815a4.463,4.463,0,0,1,2.243.62.95.95,0,0,1,.72-1.281,4.852,4.852,0,0,1,2.623.519c.034.02-.5-1.968.281-2.716a2.117,2.117,0,0,1,2.829-.274,1.821,1.821,0,0,1,.854,1.858c.063.037,2.594-.049,3.285,1.273s-.865,2.544-.807,2.626a12.192,12.192,0,0,1,2.278.892c.553.448,1.106,1.992-1.62,2.927a7.742,7.742,0,0,1-3.762-.3c-1.28-.49-1.181-2.65-1.137-2.624s-1.417,2.2-2.623,2.2a4.172,4.172,0,0,1-2.394-1.206,3.825,3.825,0,0,1-2.771.774c-3.429-.46-2.333-3.267-2.2-3.55A3.721,3.721,0,0,1,3512.81,173.815Z"
                id="cloud"
              />
            </g>
          </g>
        </svg>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  #theme-toggle-button {
    font-size: 17px;
    position: relative;
    display: inline-block;
    width: 3.5em;
    cursor: pointer;
  }

  #toggle {
    opacity: 0;
    width: 0;
    height: 0;
  }

  #container,
  #patches,
  #stars,
  #button,
  #sun,
  #moon,
  #cloud {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  #toggle:checked + svg #container {
    fill: #2b4360;
  }
  #toggle:checked + svg #button {
    transform: translate(28px, 2.333px);
  }
  #sun {
    opacity: 1;
  }
  #toggle:checked + svg #sun {
    opacity: 0;
  }
  #moon {
    opacity: 0;
  }
  #toggle:checked + svg #moon {
    opacity: 1;
  }
  #cloud {
    opacity: 1;
  }
  #toggle:checked + svg #cloud {
    opacity: 0;
  }
`;

export default ThemeToggle;
