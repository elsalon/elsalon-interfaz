<template>

    <div class="flex container min-h-screen flex-col justify-center px-6 py-12 lg:px-8">

        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
            <img src="/elsalon_logo_trans_500x250.png" class="m-auto w-[250px] invert dark:invert-0">

            <div class="prose  mt-10">
                <h3>
                    <slot name="cta">
                        Iniciá sesión
                    </slot>
                </h3>
            </div>
        </div>

        <div class="mt-2 sm:mx-auto sm:w-full sm:max-w-sm">
            <slot />
        </div>
    </div>
</template>