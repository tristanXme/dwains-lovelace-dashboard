import { css } from 'lit';
import {
  subtleBackButtonStyles,
  subtleDetailViewStyles,
  subtleDevicesPageStyles,
} from './dwains-subtle-style';

export const devicesPageCardStyles = [
  css`
    :host {
      display: block;
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }
    .dd-overview-grid {
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }
    @media (max-width: 599px) {
      .w-full {
        box-sizing: border-box;
        max-width: 100%;
      }
      .grid.dd-overview-grid > * {
        min-width: 0;
        max-width: 100%;
      }
    }
    .card-actions {
      text-align: right;
    }
    .card-actions-multiple {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0.5rem;
    }
    .sortable-move {
      cursor: -webkit-grabbing;
      cursor: grab;
      margin: auto 0;
    }
    .device-button .info ha-icon, .ha-icon ha-icon {
      display: inline-block;
      margin: auto;
      --mdc-icon-size: 100% !important;
      --iron-icon-width: 100% !important;
      --iron-icon-height: 100% !important;
    }
    #badges {
      cursor: pointer;
      background: var( --ha-card-background, var(--card-background-color, white) );
      box-shadow: var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
      color: var(--primary-text-color);
    }
    .break-words {
      overflow-wrap: break-word;
    }
    .device-button {
      cursor: pointer;
      background: var( --ha-card-background, var(--card-background-color, white) );
      border-radius: var(--ha-card-border-radius, 4px);
      box-shadow: var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
      color: var(--primary-text-color);
    }
    @media (min-width: 1024px) {
      .device-button.current {
        background: transparent;
        z-index: 1;
        position: relative;
      }
      .device-button.current::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: .12;
        z-index: -1;
        background: var(--sidebar-selected-icon-color);
        border-radius: var(--ha-card-border-radius, 4px);
      }
    }
    /*styling tailwind dwains version*/
    *, ::after, ::before {
      box-sizing: border-box;
    }
    h1,h2,h3 {
      margin: 0;
    }
    h3 {
      font-size: 1em;
    }
    .absolute {
      position: absolute
    }
    .relative {
        position: relative
    }
    .sticky {
        position: -webkit-sticky;
        position: sticky
    }
    .top-0 {
        top: 0px
    }
    .bottom-0 {
        bottom: 0px
    }
    .z-30 {
        z-index: 7;
    }
    .col-span-1 {
        grid-column: span 1 / span 1
    }
    .col-span-2 {
        grid-column: span 2 / span 2
    }
    .row-span-1 {
        grid-row: span 1 / span 1
    }
    .row-span-2 {
        grid-row: span 2 / span 2
    }
    .my-4 {
        margin-top: 1rem;
        margin-bottom: 1rem
    }
    .mx-auto {
      margin-left: auto;
      margin-right: auto
    }
    .mb-2 {
        margin-bottom: 0.5rem
    }
    .mb-4 {
        margin-bottom: 1rem
    }
    .mt-4 {
        margin-top: 1rem
    }
    .mr-0\.5 {
        margin-right: 0.125rem
    }
    .mr-0 {
        margin-right: 0px
    }
    .mb-12 {
        margin-bottom: 3rem
    }
    .mb-5 {
        margin-bottom: 1.25rem
    }
    .mb-16 {
        margin-bottom: 4rem
    }
    .ml-4 {
        margin-left: 1rem
    }
    .block {
        display: block
    }
    .inline-block {
        display: inline-block
    }
    .flex {
        display: flex
    }
    .inline-flex {
        display: inline-flex
    }
    .grid {
        display: grid
    }
    .hidden {
        display: none
    }
    .h-6 {
        height: 1.5rem
    }
    .h-44 {
        height: 11rem
    }
    .h-full {
        height: 100%
    }
    .h-14 {
        height: 3.5rem
    }
    .h-8 {
        height: 2rem
    }
    .w-full {
        width: 100%
    }
    .w-6 {
        width: 1.5rem
    }
    .w-14 {
        width: 3.5rem
    }
    .w-8 {
        width: 2rem
    }
    .w-12 {
      width: 3rem
    }
    .cursor-pointer {
        cursor: pointer
    }
    .grid-flow-row-dense {
        grid-auto-flow: row dense
    }
    .grid-cols-1 {
        grid-template-columns: repeat(1, minmax(0, 1fr))
    }
    .grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr))
    }
    .flex-wrap {
        flex-wrap: wrap
    }
    .content-between {
        align-content: space-between
    }
    .items-center {
        align-items: center
    }
    .justify-between {
        justify-content: space-between
    }
    .gap-4 {
        gap: 1rem
    }
    .space-y-0.5 > :not([hidden]) ~ :not([hidden]) {
        --tw-space-y-reverse: 0;
        margin-top: calc(0.125rem * calc(1 - var(--tw-space-y-reverse)));
        margin-bottom: calc(0.125rem * var(--tw-space-y-reverse))
    }
    .space-y-0 > :not([hidden]) ~ :not([hidden]) {
        --tw-space-y-reverse: 0;
        margin-top: calc(0px * calc(1 - var(--tw-space-y-reverse)));
        margin-bottom: calc(0px * var(--tw-space-y-reverse))
    }
    .rounded {
        border-radius: 0.25rem
    }
    .rounded-md {
        border-radius: 0.375rem
    }
    .bg-gray-800 {
        --tw-bg-opacity: 1;
        background-color: rgb(31 41 55 / var(--tw-bg-opacity))
    }
    .rounded-lg {
      border-radius: 0.5rem
    }
    .border-2 {
        border-width: 2px
    }
    .border-dashed {
        border-style: dashed
    }
    .border-gray-300 {
        --tw-border-opacity: 1;
        border-color: rgb(209 213 219 / var(--tw-border-opacity))
    }
    .bg-gray-800 {
        --tw-bg-opacity: 1;
        background-color: rgb(31 41 55 / var(--tw-bg-opacity))
    }
    .bg-opacity-50 {
        --tw-bg-opacity: 0.5
    }
    .p-2 {
      padding: 0.5rem;
    }
    .p-4 {
        padding: 1rem
    }
    .p-1 {
        padding: 0.25rem
    }
    .p-3 {
        padding: 0.75rem
    }
    .px-1 {
        padding-left: 0.25rem;
        padding-right: 0.25rem
    }
    .p-12 {
      padding: 3rem
    }
    .py-0\.5 {
        padding-top: 0.125rem;
        padding-bottom: 0.125rem
    }
    .py-0 {
        padding-top: 0px;
        padding-bottom: 0px
    }
    .text-center {
      text-align: center
    }
    .text-right {
        text-align: right
    }
    .text-xl {
        font-size: 1.5rem;
        line-height: 2rem
    }
    .text-lg {
        font-size: 1.125rem;
        line-height: 1.75rem
    }
    .text-sm {
        font-size: 0.875rem;
        line-height: 1.25rem
    }
    .text-xs {
        font-size: 0.75rem;
        line-height: 1rem
    }
    .font-semibold {
        font-weight: 600
    }
    .font-medium {
        font-weight: 500
    }
    .capitalize {
        text-transform: capitalize
    }
    .text-gray {
      color: var(--paper-item-body-secondary-color, var(--secondary-text-color));
    }
    .text-white {
        --tw-text-opacity: 1;
        color: rgb(255 255 255 / var(--tw-text-opacity))
    }
    @media (min-width: 768px) {
        .md-grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr))
        }
    }
    @media (min-width: 1024px) {
        .lg-col-span-1 {
            grid-column: span 1 / span 1
        }
        .lg-col-span-3 {
            grid-column: span 3 / span 3
        }
        .lg-col-span-2 {
            grid-column: span 2 / span 2
        }
        .lg-row-span-1 {
            grid-row: span 1 / span 1
        }
        .lg-row-span-3 {
            grid-row: span 3 / span 3
        }
        .lg-row-span-2 {
            grid-row: span 2 / span 2
        }
        .lg-block {
            display: block
        }
        .lg-hidden {
            display: none
        }
        .lg-w-1-2 {
            width: 50%
        }
        .lg-grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr))
        }
        .lg-grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr))
        }
        .lg-grid-cols-4 {
          grid-template-columns: repeat(4, minmax(0, 1fr))
        }
    }
    @media (min-width: 1536px) {
      .xl-col-span-1 {
          grid-column: span 1 / span 1
      }
      .xl-col-span-4 {
          grid-column: span 4 / span 4
      }
      .xl-col-span-2 {
          grid-column: span 2 / span 2
      }
      .xl-row-span-1 {
          grid-row: span 1 / span 1
      }
      .xl-row-span-4 {
          grid-row: span 4 / span 4
      }
      .xl-row-span-2 {
          grid-row: span 2 / span 2
      }
      .xl-w-1-3 {
          width: 33.333333%
      }
      .xl-w-2-3 {
          width: 66.666667%
      }
      .xl-grid-cols-4 {
          grid-template-columns: repeat(4, minmax(0, 1fr))
      }
      .xl-grid-cols-5 {
        grid-template-columns: repeat(5, minmax(0, 1fr))
      }
  }
  `,
  subtleBackButtonStyles(css),
  subtleDevicesPageStyles(css),
  subtleDetailViewStyles(css),
];
