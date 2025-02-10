export default {
    root: ({ props, parent }) => ({
        class: [
            // Font
            {
                'text-xs': props.size == 'small',
                'text-base': props.size == 'large',
                'text-xl': props.size == 'xlarge',
            },

            // Alignments
            'inline-flex items-center justify-center',
            'relative',

            // Sizes
            {
                'h-6 w-6':  props.size == 'small',
                'h-8 w-8': props.size == null || props.size == 'normal',
                'w-12 h-12': props.size == 'large',
                'w-16 h-16': props.size == 'xlarge'
            },
            { '-ml-4': parent.instance.$style?.name == 'avatargroup' },

            // Shapes
            {
                '' : props.shape == "",
                'rounded-lg': props.shape == 'square',
                'rounded-full': props.shape == 'circle'
            },
            { 'border-2': parent.instance.$style?.name == 'avatargroup' },

            // Colors
            'dark:bg-surface-700',
            { 'border-white dark:border-surface-800': parent.instance.$style?.name == 'avatargroup' }
        ]
    }),
    image: ({ props }) => ({
        class: [
            'h-full w-full object-cover',
            {
                'rounded-lg': props.shape == 'square',
                'rounded-full': props.shape == 'circle'
            }
        ]
    })
};
