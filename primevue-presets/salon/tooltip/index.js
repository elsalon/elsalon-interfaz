export default {
    root: ({ context }) => ({
        class: [
            // Position and Shadows
            'absolute',
            'p-fadein',
            // Spacing
            {
                'py-0 px-1': context?.right || context?.left || (!context?.right && !context?.left && !context?.top && !context?.bottom),
                'py-1 px-0': context?.top || context?.bottom
            }
        ]
    }),
    arrow: ({ context }) => ({
        class: [
            // Position

            'absolute',

            // Size
            'w-0',
            'h-0',

            // Shape
            'border-transparent',
            'border-solid',
            {
                'border-y-[10px] border-r-[10px] border-l-0 border-r-black': context?.right || (!context?.right && !context?.left && !context?.top && !context?.bottom),
                'border-y-[10px] border-l-[10px] border-r-0 border-l-black': context?.left,
                'border-x-[10px] border-t-[10px] border-b-0 border-t-black': context?.top,
                'border-x-[10px] border-b-[10px] border-t-0 border-b-black': context?.bottom
            },

            // Spacing
            {
                '-mt-[10px] top-1/2': context?.right || context?.left || (!context?.right && !context?.left && !context?.top && !context?.bottom),
                '-ml-[10px] left-1/2': context?.top || context?.bottom
            },
            'hidden'
        ]
    }),
    text: {
        class: ['p-2', 'bg-black', 'text-white', 'leading-none', 'text-xs', 'whitespace-pre-line', 'break-words']
    }
};
